import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** One running instance (main checkout or a worktree), as the dashboard sees it. */
export interface InstanceEntry {
  name: string;
  port: number;
  ref: string;
  cwd: string;
  pid: number;
  workerMode: string;
  startedAt: number;
}

export function readRegistry(path: string): InstanceEntry[] {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
    return Array.isArray(parsed) ? (parsed as InstanceEntry[]) : [];
  } catch {
    return [];
  }
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function liveInstances(path: string): InstanceEntry[] {
  return readRegistry(path).filter((e) => alive(e.pid));
}

function write(path: string, entries: InstanceEntry[]): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(entries, null, 2));
}

export function register(path: string, entry: InstanceEntry): void {
  write(path, [...liveInstances(path).filter((e) => e.port !== entry.port && e.name !== entry.name), entry]);
}

export function unregister(path: string, pid: number): void {
  write(path, readRegistry(path).filter((e) => e.pid !== pid));
}
