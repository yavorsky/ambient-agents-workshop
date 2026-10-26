import type { Questions } from './decision.ts';
import type { AgentEvent } from './types.ts';

/** The questions a decision-model gate asks about every event. Also the /decisions playground's default. */
export const GATE_QUESTIONS = {
  action: {
    type: 'choice',
    instructions: 'What should an engineering agent watching this GitHub repo do with this event?',
    criteria: {
      act: 'Real work: a bug or feature request, a failing build, a real question, a pull request to review',
      ignore: 'No work needed: reactions like +1 or thanks, chatter, automated noise',
      ask: 'Risky or destructive: deleting data, force-pushing, rotating keys, anything a human must approve first',
    },
  },
  ci: { type: 'noul', instructions: 'Is this about a failing, flaky or slow build, test or CI run?' },
  issues: { type: 'noul', instructions: 'Is this a bug report, feature request or question from a person?' },
  prs: { type: 'noul', instructions: 'Is this about a pull request that needs a review or a decision?' },
} satisfies Questions;

/** What a decision model sees of an event: the fields a person would read, nothing internal. */
export const eventState = (e: AgentEvent) => ({ kind: e.kind, from: e.actor.login, subject: e.subject, title: e.title, body: e.body?.slice(0, 1000) });
