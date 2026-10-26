import { writeFileSync } from 'node:fs';
import { buildStorm } from '../src/sources/sim.ts';

writeFileSync('fixtures/storm.json', `${JSON.stringify(buildStorm(), null, 2)}\n`);
writeFileSync(
  'fixtures/audience-issue.json',
  `${JSON.stringify(
    [
      {
        id: 'audience-1', source: 'sim', kind: 'issue_opened', actor: { login: 'workshop-guest', bot: false },
        subject: 'demo/app#200', title: 'The agent should send me a cat picture when CI goes green',
        body: 'Feature request from the audience.', at: 0,
      },
    ],
    null,
    2,
  )}\n`,
);
console.log('wrote fixtures/storm.json and fixtures/audience-issue.json');
