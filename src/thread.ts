/** One line in the main thread: something you said, the agent's answer, or a report it sent on its own. */
export interface ThreadEntry {
  id: number;
  at: number;
  kind: 'you' | 'agent' | 'report' | 'digest';
  text: string;
  subject?: string;
  /** The watch that made this worth reporting, e.g. "PRs about cats". */
  watch?: string;
  /** Set when the report asks for a yes or a no (step 5). */
  askId?: number;
  /** Earlier reports on the same subject, oldest first (step 4 groups by subject). */
  updates?: Array<{ at: number; text: string }>;
}

export interface ReportExtra {
  watch?: string;
  askId?: number;
}

const MAX_ENTRIES = 300;

/**
 * The main thread: the one place the agent talks to you. The chat writes your messages and its answers here;
 * the notifier writes the reports it sends on its own. The app shows them together.
 */
export class Thread {
  private entries: ThreadEntry[] = [];
  private seq = 0;

  constructor(private readonly now: () => number) {}

  add(kind: ThreadEntry['kind'], text: string, extra: Partial<ThreadEntry> = {}): ThreadEntry {
    const entry: ThreadEntry = { ...extra, id: ++this.seq, at: this.now(), kind, text };
    this.entries.push(entry);
    if (this.entries.length > MAX_ENTRIES) this.entries.shift();
    return entry;
  }

  /** Every report is a new entry. Step 4 groups them by subject instead. */
  report(subject: string, text: string, extra: ReportExtra = {}): ThreadEntry {
    return this.add('report', text, { subject, ...extra });
  }

  recent(limit = 150): ThreadEntry[] {
    return this.entries.slice(-limit);
  }

  /** The latest reports as one line each, for the chat's instructions. */
  reportLines(limit: number): string[] {
    return this.entries.filter((e) => e.kind === 'report' || e.kind === 'digest').slice(-limit)
      .map((e) => `- ${new Date(e.at).toTimeString().slice(0, 5)} ${e.subject ? `${e.subject}: ` : ''}${e.text}${e.watch ? ` [watch: ${e.watch}]` : ''}`);
  }

  clear(): void {
    this.entries = [];
  }
}
