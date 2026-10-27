import { isStepCount, streamText, type ModelMessage, type ToolSet } from 'ai';
import { languageModel } from './models.ts';

export interface ChatDeps {
  /** OpenRouter / AI Gateway id, resolved with `languageModel()` from ./models.ts. */
  model: string;
  tools: ToolSet;
  /** The system prompt, read fresh each turn (skills, watches and reports change). */
  instructions(): string | Promise<string>;
}

/** What the chat streams to the page, one JSON line each. */
export type ChatPart =
  | { t: 'text'; text: string }
  | { t: 'tool'; name: string; input: unknown }
  | { t: 'tool-result'; name: string; output: string }
  | { t: 'error'; error: string }
  | { t: 'done' };

const MAX_STEPS = 10;
const RESULT_PREVIEW = 400;

const preview = (output: unknown) => (typeof output === 'string' ? output : JSON.stringify(output)).slice(0, RESULT_PREVIEW);

/** The agent itself: a model, tools, a loop until it answers, and one conversation: the main thread. */
export class Chat {
  private conversation: ModelMessage[] = [];

  constructor(private readonly deps: ChatDeps) {}

  async *send(message: string): AsyncGenerator<ChatPart> {
    const conversation = [...this.conversation, { role: 'user', content: message } satisfies ModelMessage];
    const result = streamText({
      model: languageModel(this.deps.model),
      system: await this.deps.instructions(),
      messages: conversation,
      tools: this.deps.tools,
      stopWhen: isStepCount(MAX_STEPS),
    });
    for await (const part of result.fullStream) {
      if (part.type === 'text-delta') yield { t: 'text', text: part.text };
      else if (part.type === 'tool-call') yield { t: 'tool', name: part.toolName, input: part.input };
      else if (part.type === 'tool-result') yield { t: 'tool-result', name: part.toolName, output: preview(part.output) };
      else if (part.type === 'tool-error') yield { t: 'error', error: `${part.toolName}: ${String(part.error)}` };
      else if (part.type === 'error') yield { t: 'error', error: String(part.error) };
    }
    this.conversation = [...conversation, ...(await result.responseMessages)];
    yield { t: 'done' };
  }

  reset(): void {
    this.conversation = [];
  }
}
