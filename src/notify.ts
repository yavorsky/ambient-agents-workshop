import type { Clock } from './clock.ts';
import type { PingRow, Store } from './store.ts';
import type { ReportExtra, Thread } from './thread.ts';

export interface NotifierOptions {
  store: Store;
  clock: Clock;
  instance: string;
  slackWebhook: string;
  /** Print messages to stdout when there is no Slack webhook. */
  log?: boolean;
  /** The main thread: pings and the digest are reported there, next to the conversation. */
  thread?: Thread;
}

/** Delivers pings now (into the main thread, and Slack if configured) or holds them for the 09:00 digest. */
export class Notifier {
  constructor(private readonly options: NotifierOptions) {}

  send(subject: string, text: string, ping: boolean, extra: ReportExtra = {}): void {
    this.options.store.addPing(this.options.clock.now(), subject, text, !ping);
    // You asked to hear about what matches a watch: it lands in the thread even when it can wait (no ping, no Slack).
    if (ping || extra.watch) this.options.thread?.report(subject, text, extra);
    if (!ping) return;
    void this.post(`🔔 *${subject}*: ${text}`);
  }

  /** Delivers everything held since the last digest as one message. */
  digest(): PingRow[] {
    const held = this.options.store.takeHeld();
    if (held.length) {
      const lines = held.map((p) => `• ${p.subject}: ${p.text}`).join('\n');
      this.options.thread?.add('digest', `Digest, ${held.length} items:\n${lines}`);
      void this.post(`☀️ *Digest* (${held.length} items)\n${lines}`);
    }
    return held;
  }

  private async post(text: string): Promise<void> {
    const line = `[${this.options.instance}] ${text}`;
    if (!this.options.slackWebhook) {
      if (this.options.log !== false) console.log(line);
      return;
    }
    try {
      await fetch(this.options.slackWebhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: line }),
        signal: AbortSignal.timeout(5_000),
      });
    } catch (error) {
      console.warn(`[notify] Slack post failed: ${String(error)}`);
    }
  }
}
