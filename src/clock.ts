const MINUTE = 60_000;

/** Wall clock plus an offset, so the dashboard can fast-forward time for timers and the digest. */
export class Clock {
  private offset = 0;

  now(): number {
    return Date.now() + this.offset;
  }

  advance(minutes: number): void {
    this.offset += minutes * MINUTE;
  }

  /** Jump forward to the next occurrence of HH:MM in local time. */
  jumpTo(hhmm: string): void {
    const [h = 9, m = 0] = hhmm.split(':').map(Number);
    const target = new Date(this.now());
    target.setHours(h, m, 0, 0);
    if (target.getTime() <= this.now()) target.setDate(target.getDate() + 1);
    this.offset += target.getTime() - this.now();
  }
}
