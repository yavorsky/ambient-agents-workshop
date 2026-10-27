Give the agent memory as plain Markdown files, and make the chat one conversation that knows what the agent
did without carrying it all in context. Use the `Memory` class in `src/memory.ts` if it exists; otherwise create it.

1. `src/memory.ts`: a `MemoryStore` (list, read, write, removeDir) with a local-folder version (`memory/`) and a
   Daytona version used when `DAYTONA_API_KEY` is set. A `Memory` on top: `index()` (path, line count, first line),
   `read`, `write`, `append`, `remember(subject, line)` (one line in `journal/<date>.md` and in
   `subjects/<subject>.md`), `forgetActivity()` (journal and subjects, never `preferences.md`). Serialize writes.
   Reject paths outside the memory root. Export `memoryTools(memory)`: `memory_read`, `memory_write`, `memory_append`.
2. `src/pipeline.ts`: after the policy decides, `memory.remember(subject, "<summary> → <route>")`; `reset()` forgets activity.
3. `src/policy.ts` reads preferences from `memory.preferencesText()` instead of the file.
4. `src/chat.ts`: one conversation instead of one per session. Keep only the last 24 messages, cut at a user
   message. The instructions include the memory index (not the contents) and say to update `preferences.md`
   when the person says how they want to be treated.
5. `src/server.ts`: `GET /api/memory` (where + index) and `GET /api/memory/file?path=`.

`pnpm typecheck` and `pnpm eval` must still pass (6/6). Then storm, and ask the chat "What happened while I was away?"
