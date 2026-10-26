Implement `Chat` in `src/chat.ts`: the agent itself, a model with tools in a loop.

- `send(sessionId, message)` keeps one conversation per `sessionId` in memory (a `Map` of `ModelMessage[]`).
  Append the user message, then call `streamText` from `ai` with `languageModel(this.deps.model)` from
  `./models.ts`, `system: this.deps.instructions()`, the conversation, `tools: this.deps.tools` and
  `stopWhen: isStepCount(10)` so it can call tools several times before it answers.
- Iterate `result.fullStream` and yield a `ChatPart` for each `text-delta` (`text`), `tool-call`
  (`toolName`, `input`), `tool-result` (`toolName`, the output as a string cut to 400 chars) and
  `tool-error`; finish with `{ t: 'done' }`.
- After the stream ends, append `await result.responseMessages` to the conversation, so the next message
  remembers the tool calls too.
- `reset()` forgets every conversation.

Keep the exported types. `pnpm typecheck` must pass. Then restart the instance and ask it in the chat:
"What open issues do we have, and which one would you pick first?"
