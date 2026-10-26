import { SELF_MARKER } from '../config.ts';
import type { AgentEvent, EventKind } from '../types.ts';

const REPO = 'demo/app';

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

function event(kind: EventKind, subject: string, login: string, title: string, extra: Partial<AgentEvent> = {}): AgentEvent {
  return {
    id: nextId(kind),
    source: 'sim',
    kind,
    actor: { login, bot: login.endsWith('[bot]') },
    subject,
    title,
    at: Date.now(),
    ...extra,
  };
}

/** One click in the dashboard. Each scenario returns the events a real repo would send. */
export const SCENARIOS = {
  'ci-failed': () => [event('ci_failed', 'ci:main', 'github-actions', 'CI failed on main: test (inbox.test.ts)')],
  'bot-comment': () => [event('issue_comment', `${REPO}#12`, 'welcome-bot[bot]', 'Thanks for opening your first issue!', { body: 'Thanks for opening your first issue!' })],
  'dependabot-pr': () => [event('pr_opened', `${REPO}#${40 + (counter % 20)}`, 'dependabot[bot]', 'Bump undici from 6.19.2 to 6.21.0')],
  'issue-edits': () => [1, 2, 3].map((n) => event('issue_edited', `${REPO}#11`, 'maria', `Login button broken on Safari (edit ${n})`)),
  'self-echo': () => [event('issue_comment', `${REPO}#10`, 'ambient-agent', 'Re: Crash on empty config', { body: `I've labelled this as a bug. ${SELF_MARKER}` })],
  'reaction': () => [event('issue_comment', `${REPO}#10`, 'sam', '+1', { body: '+1' })],
  'pr-opened': () => [event('pr_opened', `${REPO}#${50 + (counter % 20)}`, 'lena', 'Add retry to the GitHub poller')],
  'cat-pr': () => [event('pr_opened', `${REPO}#${70 + (counter % 20)}`, 'omar', 'Cat mode: replace the loading spinner with a walking cat', { body: 'Purely cosmetic, behind a setting.' })],
  'new-issue': (title = 'Crash on empty config file', body = '') =>
    [event('issue_opened', `${REPO}#${100 + (counter % 400)}`, 'audience', title, { body })],
} satisfies Record<string, (...args: string[]) => AgentEvent[]>;

export type ScenarioName = keyof typeof SCENARIOS;

export function isScenario(name: string): name is ScenarioName {
  return name in SCENARIOS;
}

/** Seeded shuffle so the storm arrives in the same order every run. */
function shuffle<T>(items: T[], seed = 42): T[] {
  const out = [...items];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/**
 * The storm: 60 events that look like a busy hour on a real repo. Each group maps to one failure the
 * fixes remove. Ids are stable; repeated deliveries of the same CI run share an id.
 */
export function buildStorm(): AgentEvent[] {
  const e = (id: string, kind: EventKind, subject: string, login: string, title: string, body?: string): AgentEvent => ({
    id, source: 'sim', kind, actor: { login, bot: login.endsWith('[bot]') }, subject, title, body, at: 0,
  });
  const issues = [10, 11, 12, 13, 14, 15, 16, 17];
  const events: AgentEvent[] = [
    // One CI failure, seven deliveries: webhook retries share an id, re-runs get new ids.
    e('ci-9001', 'ci_failed', 'ci:main', 'github-actions', 'CI failed on main: test (inbox.test.ts)'),
    e('ci-9001', 'ci_failed', 'ci:main', 'github-actions', 'CI failed on main: test (inbox.test.ts)'),
    e('ci-9001', 'ci_failed', 'ci:main', 'github-actions', 'CI failed on main: test (inbox.test.ts)'),
    ...[9002, 9003, 9004, 9005].map((n) => e(`ci-${n}`, 'ci_failed', 'ci:main', 'github-actions', `CI failed on main (re-run ${n - 9001})`)),
    e('ci-9006', 'ci_passed', 'ci:docs', 'github-actions', 'CI passed on docs'),
    // Dependabot PRs and its rebase comments.
    ...[40, 41, 42, 43, 44, 45].map((n) => e(`dep-pr-${n}`, 'pr_opened', `${REPO}#${n}`, 'dependabot[bot]', `Bump dependency #${n}`)),
    ...[40, 41, 42, 43, 44, 45].map((n) => e(`dep-c-${n}`, 'pr_comment', `${REPO}#${n}`, 'dependabot[bot]', 'Rebased', '@dependabot rebase')),
    // Welcome bot.
    ...[10, 11, 12, 13].map((n) => e(`welcome-${n}`, 'issue_comment', `${REPO}#${n}`, 'welcome-bot[bot]', 'Thanks for opening your first issue!', 'Thanks for opening your first issue!')),
    // Issues edited three times each.
    ...[11, 14, 16].flatMap((n) => [1, 2, 3].map((k) => e(`edit-${n}-${k}`, 'issue_edited', `${REPO}#${n}`, 'maria', `Issue #${n} (edit ${k})`))),
    // Real new issues.
    ...issues.map((n) => e(`issue-${n}`, 'issue_opened', `${REPO}#${n}`, ['maria', 'sam', 'lena', 'omar'][n % 4] ?? 'maria', `Issue #${n}: ${['Crash on empty config', 'Login broken on Safari', 'Docs typo in README', 'Timeout on large repos'][n % 4]}`)),
    // Reaction-only comments.
    ...['+1', 'same here', 'thanks!', '+1', '👍', 'me too', '+1', 'same here', 'thanks!', '+1'].map((body, i) =>
      e(`react-${i}`, 'issue_comment', `${REPO}#${issues[i % issues.length]}`, ['ivan', 'chen', 'ola'][i % 3] ?? 'ivan', body, body)),
    // Real questions.
    ...[10, 12, 14, 15].map((n) => e(`q-${n}`, 'issue_comment', `${REPO}#${n}`, 'chen', 'Is there a workaround?', 'Is there a workaround until this is fixed?')),
    // Human PRs.
    ...[50, 51].map((n) => e(`pr-${n}`, 'pr_opened', `${REPO}#${n}`, 'lena', `Fix #${n - 40}`)),
    e('pr-52', 'pr_opened', `${REPO}#52`, 'lena', 'Add a cat of the day to the welcome page', 'Shows a random cat photo and a cat fact on first visit.'),
    // The agent's own earlier comments coming back.
    ...[10, 12].map((n) => e(`self-${n}`, 'issue_comment', `${REPO}#${n}`, 'ambient-agent', 'Re: triage', `Labelled as bug. ${SELF_MARKER}`)),
  ];
  return shuffle(events);
}
