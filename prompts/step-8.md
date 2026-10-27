Tech: Markdown files on disk (`node:fs`), or the same files in a Daytona sandbox through `@daytonaio/sdk` when `DAYTONA_API_KEY` is set; memory tools are AI SDK `tool()`s; the conversation is trimmed `ModelMessage[]`.

Give the agent memory as plain Markdown files, so the main thread knows what the agent did without carrying
every report in its context. Use the `Memory` class in `src/memory.ts` if it exists; otherwise create it.

1. `src/memory.ts`: a `MemoryStore` (list, read, write, removeDir) with a local-folder version (`memory/`) and a
   Daytona version used when `DAYTONA_API_KEY` is set. A `Memory` on top: `index()` (path, line count, first line),
   `read`, `write`, `append`, `remember(subject, line)` (one line in `journal/<date>.md` and in
   `subjects/<subject>.md`), `forgetActivity()` (journal and subjects, never `preferences.md`). Serialize writes.
   Reject paths outside the memory root. Export `memoryTools(memory)`: `memory_read`, `memory_write`, `memory_append`.
2. `src/pipeline.ts`: after the policy decides, `memory.remember(subject, "<summary> → <route>")`; `reset()` forgets activity.
3. `src/policy.ts` reads preferences from `memory.preferencesText()` instead of the file.
4. `src/chat.ts`: keep only the last 24 messages of the conversation, cut at a user message.
   `src/main.ts`: the chat's instructions show the memory index (not the contents) instead of the latest report
   lines, keep the watches, and say to update `preferences.md` when the person says how they want to be treated.
5. `src/server.ts`: `GET /api/memory` (where + index) and `GET /api/memory/file?path=`.

`pnpm typecheck` and `pnpm eval` must still pass (6/6). Then storm, and ask the chat "What happened while I was away?"

Done when `pnpm typecheck` passes and `pnpm eval` still shows 6/6. Change only the files named above.
