import type { ToolSet } from 'ai';

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

/** Step 1 (not done yet): the agent itself. A model, tools, a loop, and one conversation: the main thread. */
export class Chat {
  constructor(private readonly deps: ChatDeps) {}

  async *send(message: string): AsyncGenerator<ChatPart> {
    void this.deps;
    void message;
    yield { t: 'text', text: 'I am not built yet. Paste prompts/step-1.md into Claude Code.' };
    yield { t: 'done' };
  }

  reset(): void {}
}
