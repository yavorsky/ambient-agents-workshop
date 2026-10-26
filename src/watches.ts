import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** A watch may carry an instruction: "issues opened by yavorsky → reply that we have no capacity". The gate matches the topic. */
export const watchTopic = (watch: string) => watch.split(' → ')[0]?.trim() ?? watch;

const HEADER = '# Watches\n\nWhat to tell me about, one per line in plain words. The agent checks every event against these.\n\n';

/** Standing instructions: "watch for PRs about cats". Plain lines in memory/watches.md, editable by hand or by the chat. */
export class Watches {
  constructor(private readonly path: string) {}

  list(): string[] {
    if (!existsSync(this.path)) return [];
    return readFileSync(this.path, 'utf8').split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim()).filter(Boolean);
  }

  add(text: string): string[] {
    const watch = text.trim().replace(/\s+/g, ' ');
    const all = this.list();
    if (watch && !all.some((w) => w.toLowerCase() === watch.toLowerCase())) this.save([...all, watch]);
    return this.list();
  }

  remove(text: string): string[] {
    this.save(this.list().filter((w) => w.toLowerCase() !== text.trim().toLowerCase()));
    return this.list();
  }

  private save(watches: string[]): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, `${HEADER}${watches.map((w) => `- ${w}`).join('\n')}\n`);
  }
}
