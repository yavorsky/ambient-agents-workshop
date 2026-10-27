import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { tool, type ToolSet } from 'ai';
import { z } from 'zod';
import type { Clock } from './clock.ts';
import type { Store } from './store.ts';

/** Where the memory files live: a folder here, or a folder in a sandbox. Paths are relative to the memory root. */
export interface MemoryStore {
  readonly where: string;
  list(): Promise<string[]>;
  read(path: string): Promise<string | undefined>;
  write(path: string, text: string): Promise<void>;
  removeDir(path: string): Promise<void>;
}

export interface MemoryFile {
  path: string;
  lines: number;
  /** The first line, without "#": what the file is about. */
  about: string;
}

const PREFERENCES = 'preferences.md';
const ACTIVITY_DIRS = ['journal', 'subjects'];
const MAX_INDEX = 40;

/** Rejects absolute paths and "..": memory tools stay inside the memory root. */
export function safePath(path: string): string {
  const clean = normalize(path.replace(/^\/+(memories?\/)?/, ''));
  if (!clean || clean.startsWith('..') || clean.startsWith('/')) throw new Error(`not a memory path: ${path}`);
  return clean;
}

export class LocalMemoryStore implements MemoryStore {
  constructor(private readonly root: string) {}

  get where(): string {
    return this.root;
  }

  async list(): Promise<string[]> {
    const walk = (dir: string): string[] =>
      existsSync(join(this.root, dir))
        ? readdirSync(join(this.root, dir)).flatMap((name) => {
            const rel = dir ? `${dir}/${name}` : name;
            return statSync(join(this.root, rel)).isDirectory() ? walk(rel) : [rel];
          })
        : [];
    return walk('').filter((p) => p.endsWith('.md'));
  }

  async read(path: string): Promise<string | undefined> {
    const full = join(this.root, path);
    return existsSync(full) ? readFileSync(full, 'utf8') : undefined;
  }

  async write(path: string, text: string): Promise<void> {
    const full = join(this.root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, text);
  }

  async removeDir(path: string): Promise<void> {
    rmSync(join(this.root, path), { recursive: true, force: true });
  }
}

/** The shape of the parts of `@daytonaio/sdk` this file uses. */
interface DaytonaSandbox {
  id: string;
  state?: string;
  start(): Promise<void>;
  fs: {
    listFiles(path: string): Promise<Array<{ name: string; isDir: boolean }>>;
    downloadFile(path: string): Promise<Buffer>;
    uploadFile(file: Buffer, path: string): Promise<void>;
    createFolder(path: string, mode: string): Promise<void>;
    deleteFile(path: string, recursive?: boolean): Promise<void>;
  };
}
interface DaytonaClient {
  create(): Promise<DaytonaSandbox>;
  get(id: string): Promise<DaytonaSandbox>;
}

/** Memory files in a Daytona sandbox. One sandbox per instance; its id is kept in the store to reuse it. */
export class DaytonaMemoryStore implements MemoryStore {
  private sandbox?: Promise<DaytonaSandbox>;
  private readonly root = 'memory';

  constructor(private readonly apiKey: string, private readonly store: Store) {}

  get where(): string {
    return `daytona:${this.store.get('daytona:sandbox') ?? 'new sandbox'}/${this.root}`;
  }

  private box(): Promise<DaytonaSandbox> {
    this.sandbox ??= (async () => {
      const name = '@daytonaio/sdk';
      const sdk = (await import(name).catch(() => {
        throw new Error('DAYTONA_API_KEY is set but @daytonaio/sdk is not installed: pnpm add @daytonaio/sdk');
      })) as { Daytona: new (options: { apiKey: string }) => DaytonaClient };
      const client = new sdk.Daytona({ apiKey: this.apiKey });
      const id = this.store.get('daytona:sandbox');
      const sandbox = id ? await client.get(id).catch(() => client.create()) : await client.create();
      // Daytona stops an idle sandbox after 15 minutes; its files stay, but it must run to read them.
      if (sandbox.state && sandbox.state !== 'started') await sandbox.start();
      this.store.set('daytona:sandbox', sandbox.id);
      return sandbox;
    })();
    return this.sandbox;
  }

  async list(): Promise<string[]> {
    const { fs } = await this.box();
    const walk = async (dir: string): Promise<string[]> => {
      const entries = await fs.listFiles(`${this.root}/${dir}`).catch(() => []);
      const nested = await Promise.all(entries.map((e) => {
        const rel = dir ? `${dir}/${e.name}` : e.name;
        return e.isDir ? walk(rel) : Promise.resolve([rel]);
      }));
      return nested.flat();
    };
    return (await walk('')).filter((p) => p.endsWith('.md'));
  }

  async read(path: string): Promise<string | undefined> {
    const { fs } = await this.box();
    return fs.downloadFile(`${this.root}/${path}`).then((b) => b.toString('utf8'), () => undefined);
  }

  async write(path: string, text: string): Promise<void> {
    const { fs } = await this.box();
    const dir = dirname(`${this.root}/${path}`);
    await fs.createFolder(dir, '755').catch(() => undefined);
    await fs.uploadFile(Buffer.from(text), `${this.root}/${path}`);
  }

  async removeDir(path: string): Promise<void> {
    const { fs } = await this.box();
    await fs.deleteFile(`${this.root}/${path}`, true).catch(() => undefined);
  }
}

export function memoryStore(store: Store): MemoryStore {
  const key = process.env.DAYTONA_API_KEY;
  return key ? new DaytonaMemoryStore(key, store) : new LocalMemoryStore(process.env.MEMORY_DIR ?? join(process.cwd(), 'memory'));
}

const slug = (subject: string) => subject.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'misc';

/**
 * Step 7: memory as plain Markdown files. Workers write what they did; the chat sees only an index and
 * reads a file when it needs one; preferences.md is what the policy obeys.
 */
export class Memory {
  private queue: Promise<unknown> = Promise.resolve();
  private preferences = '';

  constructor(private readonly files: MemoryStore, private readonly clock: Clock) {}

  get where(): string {
    return this.files.where;
  }

  async load(): Promise<void> {
    this.preferences = (await this.files.read(PREFERENCES)) ?? '';
  }

  /** Synchronous, for the policy, which decides on every result. Kept current by `write`. */
  preferencesText(): string {
    return this.preferences;
  }

  async index(): Promise<MemoryFile[]> {
    const paths = (await this.files.list()).sort((a, b) => Number(b === PREFERENCES) - Number(a === PREFERENCES) || a.localeCompare(b));
    return Promise.all(paths.slice(0, MAX_INDEX).map(async (path) => {
      const text = (await this.files.read(path)) ?? '';
      const lines = text.split('\n').filter((l) => l.trim());
      return { path, lines: lines.length, about: (lines[0] ?? '').replace(/^#+\s*/, '').slice(0, 100) };
    }));
  }

  read(path: string): Promise<string | undefined> {
    return this.files.read(safePath(path));
  }

  write(path: string, text: string): Promise<void> {
    const clean = safePath(path);
    return this.serial(async () => {
      await this.files.write(clean, text);
      if (clean === PREFERENCES) this.preferences = text;
    });
  }

  append(path: string, line: string): Promise<void> {
    const clean = safePath(path);
    return this.serial(async () => {
      const before = (await this.files.read(clean)) ?? `# ${clean.replace(/\.md$/, '')}\n`;
      await this.files.write(clean, `${before.replace(/\n*$/, '\n')}${line}\n`);
    });
  }

  /** One line per handled subject: in today's journal and in the subject's own file. */
  async remember(subject: string, line: string): Promise<void> {
    const at = new Date(this.clock.now());
    const time = at.toTimeString().slice(0, 5);
    await this.append(`journal/${at.toISOString().slice(0, 10)}.md`, `- ${time} ${subject}: ${line}`);
    await this.append(`subjects/${slug(subject)}.md`, `- ${at.toISOString().slice(0, 10)} ${time} ${line}`);
  }

  /** On reset: forget what happened, keep what the person said (preferences). */
  forgetActivity(): Promise<void> {
    return this.serial(async () => void (await Promise.all(ACTIVITY_DIRS.map((d) => this.files.removeDir(d)))));
  }

  private serial<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }
}

/** The chat's memory tools. The index is already in its instructions, so there is no "list everything". */
export function memoryTools(memory: Memory): ToolSet {
  return {
    memory_read: tool({
      description: 'Read one memory file, e.g. "journal/2026-10-27.md" or "subjects/ci-main.md".',
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => (await memory.read(path)) ?? `No memory file "${path}".`,
    }),
    memory_write: tool({
      description: 'Replace a memory file. Use it for preferences.md when the person says how they want to be treated.',
      inputSchema: z.object({ path: z.string(), content: z.string() }),
      execute: async ({ path, content }) => {
        await memory.write(path, content);
        return `saved ${path}`;
      },
    }),
    memory_append: tool({
      description: 'Add one line to a memory file: a fact worth keeping for later conversations.',
      inputSchema: z.object({ path: z.string(), line: z.string() }),
      execute: async ({ path, line }) => {
        await memory.append(path, line);
        return `added to ${path}`;
      },
    }),
  };
}
