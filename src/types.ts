export type EventKind =
  | 'ci_failed'
  | 'ci_passed'
  | 'issue_opened'
  | 'issue_edited'
  | 'issue_comment'
  | 'pr_opened'
  | 'pr_comment'
  | 'timer';

/** One normalized event. Every source (GitHub poller, simulator, timers) produces this shape. */
export interface AgentEvent {
  id: string;
  source: 'github' | 'sim' | 'timer';
  kind: EventKind;
  actor: { login: string; bot: boolean };
  /** What the event is about: `owner/repo#12`, `ci:main`. Work is keyed by subject. */
  subject: string;
  title: string;
  body?: string;
  url?: string;
  at: number;
  /** The signal the gate routed this event to, when it decided one (decision mode). */
  route?: Signal;
  /** The watch this event matched, set by the gate (step 3). Reports carry it as their label. */
  watch?: string;
}

export type Signal = 'ci' | 'issues' | 'prs';

export interface FilterResult {
  keep: boolean;
  reason?: string;
}

export interface Verdict {
  id: string;
  action: 'act' | 'ignore' | 'ask';
  reason: string;
  /** Set when the gate routed the event to a signal (decision mode); otherwise the kind decides. */
  signal?: Signal;
  /** The decision model's probability for the chosen action. */
  confidence?: number;
  /** The watch the event matched; an event that matches no watch is ignored (step 3). */
  watch?: string;
}

export type OfferResult = 'started' | 'merged';

export interface WorkerResult {
  sessionId: string;
  summary: string;
  /** What the agent did or wants to do, e.g. "label + comment", "merge PR". */
  action: string;
  reversible: boolean;
  confidence: number;
  /** The agent asks to be woken up again later about the same subject. */
  wakeupInMinutes?: number;
  /** The run posted a comment back to the subject (which comes back as a new event). */
  commented?: boolean;
}

export type Route = 'act' | 'draft' | 'ask' | 'note';

export interface Decision {
  route: Route;
  /** true: message the human now. false: hold it for the 09:00 digest. */
  ping: boolean;
  why: string;
}

export type Stage = 'received' | 'filtered' | 'ignored' | 'merged' | 'queued' | 'working' | 'done';

export interface Stats {
  received: number;
  filtered: number;
  gateCalls: number;
  ignored: number;
  merged: number;
  workerRuns: number;
  activeWorkers: number;
  maxWorkers: number;
  pingsSent: number;
  pingsHeld: number;
  timersFired: number;
  sessions: number;
}
