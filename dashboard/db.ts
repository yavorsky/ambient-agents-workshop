import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const ROWS = 40;
const CELL = 160;

export interface Column { name: string; type: string; pk: boolean; notNull: boolean; default: string | null }
export interface TableView { name: string; columns: Column[]; count: number; rows: Record<string, unknown>[] }
export interface FileView { path: string; lines: number; firstLine: string }
export interface DbView { path: string; exists: boolean; tables: TableView[]; files: FileView[] }

const clip = (v: unknown) => (typeof v === 'string' && v.length > CELL ? `${v.slice(0, CELL)}… (${v.length} chars)` : v);

/** One agent's SQLite file, opened read-only next to the running agent, and its memory files. */
export function inspect(cwd: string): DbView {
  const path = join(cwd, '.data', 'agent.db');
  const view: DbView = { path: relative(process.cwd(), path), exists: existsSync(path), tables: [], files: memoryFiles(cwd) };
  if (!view.exists) return view;
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const names = db.prepare("select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name").all() as Array<{ name: string }>;
    view.tables = names.map(({ name }) => {
      const columns = (db.prepare(`pragma table_info("${name}")`).all() as Array<{ name: string; type: string; pk: number; notnull: number; dflt_value: string | null }>)
        .map((c) => ({ name: c.name, type: c.type || 'any', pk: c.pk > 0, notNull: c.notnull > 0, default: c.dflt_value }));
      const count = (db.prepare(`select count(*) as n from "${name}"`).get() as { n: number }).n;
      const rows = (db.prepare(`select * from "${name}" order by rowid desc limit ${ROWS}`).all() as Record<string, unknown>[])
        .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, clip(v)])));
      return { name, columns, count, rows };
    });
  } finally {
    db.close();
  }
  return view;
}

function memoryFiles(cwd: string): FileView[] {
  const root = join(cwd, 'memory');
  if (!existsSync(root)) return [];
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => {
    const full = join(dir, n);
    return statSync(full).isDirectory() ? walk(full) : n.endsWith('.md') ? [full] : [];
  });
  return walk(root).map((full) => {
    const lines = readFileSync(full, 'utf8').split('\n').filter((l) => l.trim());
    return { path: relative(cwd, full), lines: lines.length, firstLine: (lines[0] ?? '').replace(/^#+\s*/, '').slice(0, 80) };
  });
}
