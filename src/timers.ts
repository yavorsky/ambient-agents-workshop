import { tool, type ToolSet } from 'ai';
import { z } from 'zod';
import type { Clock } from './clock.ts';
import type { Store } from './store.ts';
import type { AgentEvent } from './types.ts';

/** Reasons that start with this are reminders the person asked for; they go straight to the thread when due. */
export const REMINDER = 'Reminder:';

/**
 * Timers are signals too. The worker books its own wakeups ("CI still running, check in 10 min");
 * due wakeups come back as `timer` events through the same pipeline as everything else.
 */
export class Timers {
  constructor(
    private readonly store: Store,
    private readonly clock: Clock,
  ) {}

  schedule(subject: string, inMinutes: number, reason: string): void {
    this.store.addWakeup(this.clock.now() + inMinutes * 60_000, subject, reason);
  }

  due(): AgentEvent[] {
    return this.store.takeDueWakeups(this.clock.now()).map((w) => ({
      id: `wakeup-${w.id}`,
      source: 'timer',
      kind: 'timer',
      actor: { login: 'clock', bot: false },
      subject: w.subject,
      title: w.reason.startsWith(REMINDER) ? w.reason : `Wakeup: ${w.reason}`,
      at: this.clock.now(),
    }));
  }

  /** Minutes from now until the next HH:MM on the agent's clock (tomorrow if it already passed today). */
  minutesUntil(hhmm: string): number {
    const [h = 0, m = 0] = hhmm.split(':').map(Number);
    const now = this.clock.now();
    const at = new Date(now);
    at.setHours(h, m, 0, 0);
    if (at.getTime() <= now) at.setDate(at.getDate() + 1);
    return Math.ceil((at.getTime() - now) / 60_000);
  }

  pending(): Array<{ at: number; subject: string; reason: string }> {
    return this.store.pendingWakeups().map(({ at, subject, reason }) => ({ at, subject, reason }));
  }
}

/**
 * The chat's reminder tool: "remind me in 30 minutes to review the cat PR". It books the same kind of wakeup the
 * agent books for itself; when it is due it comes back as a timer event and lands in the main thread.
 */
export function reminderTools(timers: Timers): ToolSet {
  return {
    remind: tool({
      description: 'Set a reminder for the person. It comes back into this thread when due. Give inMinutes, or at as HH:MM (24h, the agent clock).',
      inputSchema: z.object({
        what: z.string().describe('What to remind them about, in their words'),
        inMinutes: z.number().positive().optional(),
        at: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
      }),
      execute: async ({ what, inMinutes, at }) => {
        const minutes = inMinutes ?? (at ? timers.minutesUntil(at) : undefined);
        if (!minutes) return 'Say when: inMinutes or at (HH:MM).';
        timers.schedule('reminders', minutes, `${REMINDER} ${what}`);
        return `Reminder set, in ${minutes} min: ${what}`;
      },
    }),
  };
}
