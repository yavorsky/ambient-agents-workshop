Tech: TypeScript on Node 22 (tsx, ESM), Vercel AI SDK v7 (`ai`: `streamText`, `isStepCount`, `ModelMessage`), OpenRouter through `@openrouter/ai-sdk-provider` via `languageModel()` in `src/models.ts`, tools defined with `tool()` + zod 4 in `src/tools.ts`.

Implement `Chat` in `src/chat.ts`: the agent itself, a model with tools in a loop.

- `send(message)` keeps one conversation (`ModelMessage[]`): this is the main thread, where the agent will also
  report on its own from step 3. Append the user message, then call `streamText` from `ai` with
  `languageModel(this.deps.model)` from `./models.ts`, `system: await this.deps.instructions()`, the conversation,
  `tools: this.deps.tools` and
  `stopWhen: isStepCount(10)` so it can call tools several times before it answers.
- Iterate `result.fullStream` and yield a `ChatPart` for each `text-delta` (`text`), `tool-call`
  (`toolName`, `input`), `tool-result` (`toolName`, the output as a string cut to 400 chars) and
  `tool-error`; finish with `{ t: 'done' }`.
- After the stream ends, append `await result.responseMessages` to the conversation, so the next message
  remembers the tool calls too.
- `reset()` forgets the conversation.

Keep the exported types. `pnpm typecheck` must pass. Then restart the instance and ask it in its app:
"What open issues do we have, and which one would you pick first?"
