// Content of the /stage presentation. Each chapter is a list of sections the page knows how to draw.
// Every link is public: the slides are about this workshop app and the products that inspired it.

const LINKS = {
  pulse: ['ChatGPT Pulse announcement', 'https://openai.com/index/introducing-chatgpt-pulse/'],
  grokRoutines: ['Grok Bot: skills, routines and automations', 'https://docs.x.ai/grok-bot/skills-routines-and-automations'],
  grokTalk: ['Stanford CS146S: How always-on agents work (Lee Robinson)', 'https://www.youtube.com/watch?v=L1OBRtfPS34'],
  grokPost: ['Lee Robinson’s post on the talk', 'https://x.com/leerob/status/2108650243365736855'],
  claudeAction: ['Claude Code GitHub Action', 'https://github.com/anthropics/claude-code-action'],
  claudeLoop: ['Claude Code: scheduled tasks and /loop', 'https://code.claude.com/docs/en/scheduled-tasks'],
  claudeHeadless: ['Claude Code headless mode (claude -p)', 'https://code.claude.com/docs/en/headless'],
  ruler: ['Ruler: one rules folder for every coding agent', 'https://github.com/intellectronica/ruler'],
  aiSdk: ['AI SDK: structured data', 'https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data'],
  openrouter: ['OpenRouter', 'https://openrouter.ai'],
  openclaw: ['OpenClaw (code at 313b84fd)', 'https://github.com/openclaw/openclaw/tree/313b84fd'],
  openmaus: ['OpenMausBot (code at 6c95883)', 'https://github.com/milind-soni/OpenMausBot/tree/6c95883'],
  openbot: ['OpenBot by CopilotKit (code at bd4dc94)', 'https://github.com/CopilotKit/openbot/tree/bd4dc94'],
  openduet: ['Open Duet (code at e2e0696)', 'https://github.com/Anil-matcha/open-duet/tree/e2e0696'],
  playground: ['Decision models: explainer and playground', '/decisions'],
  clef: ['Clef on Workers AI', 'https://developers.cloudflare.com/workers-ai/models/clef/'],
  clefCard: ['Clef model card (open weights)', 'https://huggingface.co/Cloudflare/clef'],
  jev: ['Jev quickstart (TypeSafe)', 'https://docs.typesafe.ai/introduction/quickstart'],
  clefNews: ['Cloudflare open-sources decision models', 'https://www.infoq.com/news/2026/10/clef-decision-models/'],
  skills: ['The skills in this repo', 'https://github.com/yavorsky/ambient-agents-workshop/tree/main/.ruler/skills'],
};
const L = (...keys) => keys.map((k) => LINKS[k]);

window.STAGE_AGENDA = [
  [0, 5, 'Hook + demo', 'talk'],
  [5, 10, 'Anatomy + my stack', 'talk'],
  [10, 18, 'v0, then break it', 'live'],
  [18, 32, 'Fixes: filter · gate · coalesce', 'live'],
  [32, 40, 'Ask vs act · timers', 'live'],
  [40, 48, 'Ship: review → PR', 'live'],
  [48, 52, 'Blueprint', 'talk'],
  [52, 55, 'Q&A', 'talk'],
];

window.STAGE_CHAPTERS = [
  // ---------------------------------------------------------------- intro
  {
    id: 'title', part: 'Intro', nav: 'Welcome', step: null,
    eyebrow: 'Workshop · 55 minutes · Art Yavorskyi',
    title: 'Agents that work while you don’t',
    lede: 'Most agents wait for a prompt. Today we build one that watches a GitHub repo and a clock, decides what is worth doing, does it, and pings a person only when it should. We start naive, break it with a storm of 60 real-looking events, and fix it in five steps, each one a lesson from running an ambient agent in production.',
    sections: [
      { type: 'agenda' },
      { type: 'cards', cols: 3, items: [
        { h: 'You leave with', html: 'A working repo: the agent, a 60-event storm, six evals, and every step as a git tag you can check out.' },
        { h: 'Built live', html: 'In Claude Code, one prompt per step. If a step runs long, I load the next tag and keep going.' },
        { h: 'Ask anything', html: 'Open an issue on the workshop repo during the session and watch the agent pick it up.' },
      ] },
    ],
    say: [
      'Who has an agent that runs without being asked? Who trusts it to?',
      'I build ambient agents for a living; today is a small, readable version of what I learned.',
      'Agenda: 10 minutes of context, 40 minutes of building, 5 minutes of questions.',
    ],
  },
  {
    id: 'signals', part: 'Intro', nav: 'From prompts to signals', step: null,
    eyebrow: 'The idea',
    title: 'From prompts to signals',
    lede: 'A chat agent sits idle until you type. An ambient agent listens to events and a clock, does the work it can, and you hear from it only when it needs you.',
    sections: [
      { type: 'lanes' },
      { type: 'cards', cols: 3, items: [
        { h: 'A signal is anything that happens', html: 'A webhook (CI failed, issue opened, PR ready), a message in a channel, a CRM field changing, an email arriving, or a timer the agent booked for itself.' },
        { h: 'The agent decides what to do', html: 'Ignore it, act and note it, draft something for review, ask a person first, or hold it for the morning digest.' },
        { h: 'Your attention is the budget', html: 'The hard part is not doing the work. It is doing it without flooding a person who never asked for anything.' },
      ] },
    ],
    say: [
      'Chat: you are in the loop every turn. Ambient: you are the exception path.',
      'Every design choice today is about two costs: model calls and your attention.',
    ],
  },
  {
    id: 'wild', part: 'Intro', nav: 'Already shipping', step: null,
    eyebrow: 'In the wild',
    title: 'Ambient agents are already shipping',
    lede: 'OpenAI, xAI and Anthropic all ship one, and so does open source. Each answers the same three questions differently: what wakes it up, where does the work run, and how does the result reach you?',
    sections: [
      { type: 'examples', items: [
        { name: 'ChatGPT Pulse', by: 'OpenAI · Sep 2025',
          body: 'Researches overnight from your chats, memory and connected apps such as your calendar, and shows a few visual cards the next morning. You steer it by marking what was useful.',
          trigger: 'Nightly, on its own', runs: 'Background research', reach: 'Cards in the morning', links: L('pulse') },
        { name: 'Grok Bot', by: 'xAI',
          body: 'An AI teammate with its own computer. Routines run on a schedule or after an event such as a Slack message or a GitHub notification, even with your laptop closed.',
          trigger: 'Schedule or event', runs: 'The bot’s own cloud computer', reach: 'Its conversation; posting back needs approval', links: L('grokRoutines', 'grokTalk') },
        { name: 'Claude Code GitHub Action', by: 'Anthropic',
          body: 'Wakes on an @claude mention, an issue assignment or a workflow event, then answers questions or implements changes on the PR or issue.',
          trigger: 'Mention or repo event', runs: 'A CI job', reach: 'Comments and commits', links: L('claudeAction') },
        { name: 'Claude Code /loop', by: 'Anthropic',
          body: 'Lets Claude choose when to look again: it books its own next wakeup instead of polling on a fixed cron.',
          trigger: 'A wakeup it booked', runs: 'The same session', reach: 'The next iteration', links: L('claudeLoop') },
        { name: 'OpenClaw', by: 'Open source',
          body: 'A self-hosted personal agent. Webhooks and cron jobs run in a fresh, isolated session by default; your main chat only hears one line when something needs you.',
          trigger: 'Webhooks, cron jobs', runs: 'An isolated session per event', reach: 'One line in your main chat', links: L('openclaw') },
      ] },
    ],
    say: [
      'Pulse: proactive, nightly, cards. Grok Bot: routines on events. Claude Action: wakes on mentions.',
      'Same three questions every time: trigger, where the work runs, how it reaches you.',
      'Our workshop app answers the same three questions; keep them in mind for the next slide.',
    ],
  },
  {
    id: 'compare', part: 'Intro', nav: 'Where signals go', step: null,
    eyebrow: 'Research · read from code at pinned commits',
    title: 'Where the work goes: five agents compared',
    lede: 'We read the code of four open-source always-on agents and watched Lee Robinson’s talk on Grok Bot. Every product built for volume does the work outside your main chat and sends back one line, a question, or nothing.',
    sections: [
      { type: 'table', label: 'Comparison of always-on agents',
        head: ['', 'Where an event’s work runs', 'What your chat sees', 'Bursts', 'Remembers between runs'],
        rows: [
          ['<b>OpenClaw</b>', 'A fresh <code>hook:&lt;uuid&gt;</code> session per event (isolated by default)', 'One line, queued for the next turn, only on failure or when nothing was delivered', 'Chat messages merge after a 500 ms quiet window; hooks don’t merge', 'Only with an opt-in named session'],
          ['<b>OpenMausBot</b>', 'A hidden conversation per run', 'The last reply as one message, held until the chat is idle; “NOTHING NEW” posts nothing', 'Yes: new events join the queued run, up to 20 events', 'Opt-in: the last report, 2,000 characters'],
          ['<b>OpenBot</b>', 'The channel’s own thread', 'Everything: the work happens in that thread', 'No: one run per event; a lock refuses your next message (409)', 'A rolling “Progress so far” note'],
          ['<b>Open Duet</b>', 'A new conversation per run', 'A notification bell, optionally Telegram', 'No; webhooks aren’t deduplicated, 3 open runs → 429', 'No'],
          ['<b>Grok Bot</b> <span class="muted">(talk)</span>', 'Helpers: sub-agents with fresh context, each a durable workflow', 'Only through one SendToUser tool, after a “do I need to bug the user” check', 'Yes: “three or four messages very quickly” become one turn', 'The main agent does; helpers start fresh'],
          ['<b>Our workshop app</b>', 'One session per signal (CI, issues, PRs); runs queue', 'A ping only for a draft or an ask, within a daily budget; the rest in the 09:00 digest', 'Yes: one run per subject, merged while busy and for 5 minutes after', 'Yes: the signal’s session is resumed'],
        ],
        note: 'Grok Bot comes from a talk, not code: no limits or exact rules were given.' },
      { type: 'cards', cols: 2, items: [
        { h: 'What everyone agrees on', html: 'Say nothing by default. Keep a result to one line. Send the answer to a question back to the run that asked it.' },
        { h: 'What nobody has solved', html: 'Lee Robinson named it in the talk: knowing “when the agent is silent or when it kind of bugs you.” Step 4 is our attempt.' },
      ] },
      { type: 'links', items: L('playground', 'clef', 'jev', 'grokTalk', 'grokPost', 'openclaw', 'openmaus', 'openbot', 'openduet') },
    ],
    say: [
      'Only one of the five does signal work in the main chat, and it blocks your next message.',
      'The last row is what we build today; each column is one of our steps.',
      'Long-lived sessions remember, but grow context and keep injections around; that is the trade-off.',
    ],
  },
  {
    id: 'lessons', part: 'Intro', nav: 'Six lessons', step: null,
    eyebrow: 'What we will build in',
    title: 'Six lessons, one per fix',
    lede: 'Each fix is something that breaks in every ambient agent sooner or later, and each has a product above that already handles it. Click a step to jump there.',
    sections: [
      { type: 'lessons', items: [
        { title: 'Drop on shape before any model sees it', source: 'Bots, edits, green builds and its own posts are visible in fields every event already carries. Plain code, no model, a reason for every drop.', go: 'gate', chip: 'step-2 · prefilter' },
        { title: 'Judge with a decision model, escalate when unsure', source: 'A decision model (Jev, Clef) answers typed questions about every event with probabilities in milliseconds; only the unsure ones go to an LLM. Grok Bot runs a “do I need to bug the user” check before its main agent.', go: 'decisions', chip: 'step-2 · gate' },
        { title: 'Dedupe, then merge bursts', source: 'Grok Bot: a router “dedupes that and figures out how to put it into the conversation”; “three or four messages very quickly” become one turn.', go: 'inbox', chip: 'step-3 · inbox' },
        { title: 'Work in side sessions that report results', source: 'Grok Bot helpers return only their result; OpenMausBot posts one line, or nothing. Our worker keeps one session per signal and reports a summary, not its tool calls.', go: 'policy', chip: 'step-4 · sessions' },
        { title: 'Decide whether to bug the person', source: 'The unsolved part. We make it a policy (can it be undone × how sure) and a ping budget written in plain words.', go: 'policy', chip: 'step-4 · policy' },
        { title: 'Let the agent book its own wakeups', source: 'Claude Code /loop chooses its next interval; Grok Bot routines run on a schedule with the laptop closed.', go: 'timers', chip: 'step-5 · timers' },
      ] },
    ],
    say: ['Cheap things first: each later box sees fewer events.'],
  },
  {
    id: 'anatomy', part: 'Intro', nav: 'Anatomy and stack', step: null,
    eyebrow: 'Anatomy + my stack',
    title: 'Five boxes, one file each',
    lede: 'Signals come in, plain code throws most away, a small model decides on the rest, an inbox merges repeats, and only then does a real agent session do work. A policy decides whether you hear about it. This is the finished agent; we build it from v0 next.',
    sections: [
      { type: 'live' },
      { type: 'cards', cols: 3, items: [
        { h: 'What we build', html: 'A TypeScript service that watches the workshop repo (issues, PRs, CI) and a clock. It triages issues, looks into a red CI run, reviews PRs and sends a 09:00 digest.' },
        { h: 'Claude Code builds it', html: 'One prompt per step (<code>prompts/step-N.md</code>). The evals say when a step is done: <code>pnpm eval</code> goes 0 → 6.' },
        { h: 'Claude Code runs it', html: '<code>WORKER_MODE=claude</code> runs each turn as <code>claude -p --resume</code> with the repo’s skills and a <code>gh</code> allowlist.' },
        { h: 'Skills, everywhere', html: '<code>triage-issue</code>, <code>fix-ci</code>, <code>code-review</code> are the worker’s job descriptions. Ruler syncs them to Claude Code, Codex, Cursor and OpenCode.' },
        { h: 'Two kinds of model', html: 'A decision model (Jev or Clef) answers the gate’s questions on every event in milliseconds. LLMs through OpenRouter and the AI SDK handle the unsure events and the work itself.' },
        { h: 'Boring storage', html: 'Node 22, <code>node:sqlite</code>, tsx, no build. Worktrees run old and new side by side; this page drives a <code>stage</code> worktree.' },
      ] },
      { type: 'links', items: L('claudeHeadless', 'ruler', 'aiSdk', 'openrouter') },
    ],
    pointsTitle: 'Where each box lives',
    points: [
      '<code>prefilter.ts</code> and <code>gate.ts</code> drop events: that is where the cost goes away.',
      '<code>inbox.ts</code> keys work by subject; <code>worker.ts</code> runs one session per signal.',
      '<code>policy.ts</code> and <code>timers.ts</code> decide when you hear from it, and when it looks again.',
    ],
    actions: [['load', 'Load the finished agent', 5], ['storm'], ['reset']],
    caption: 'The finished pipeline. Storm it once to see the shape, then load v0.',
    say: [
      'Storm the finished agent: one or two pings out of 60 events.',
      'Then load v0. Everything after this is making v0 behave like this.',
    ],
  },

  // ---------------------------------------------------------------- build
  {
    id: 'v0', part: 'Build', nav: 'v0, then break it', step: 1,
    eyebrow: 'Step 1 · the naive version',
    title: 'v0: every event wakes a worker',
    lede: 'The obvious loop: every event goes to a worker, and whatever comes back pings you. With one event it looks fine. Then we replay a recorded busy hour: 60 events in ten seconds.',
    sections: [
      { type: 'live' },
      { type: 'cards', cols: 3, items: [
        { h: 'What is in the storm', html: 'One CI failure delivered 7 times (3 retries, 4 re-runs) · 6 dependabot PRs and 6 rebase comments · 4 welcome-bot comments · 3 issues edited 3 times each · 8 real issues · 10 “+1 / thanks” · 4 real questions · 3 human PRs · 2 of the agent’s own comments coming back.' },
        { h: 'What breaks', html: 'Every event is a worker run, dozens at once. The agent’s own replies come back as new events and it answers itself. Every result pings you, so you stop reading the pings.' },
        { h: 'How others do it', html: 'OpenBot runs every routine in the channel’s own thread, one run per event, and a lock then refuses your next message with a 409. Open Duet doesn’t deduplicate webhooks at all. v0 is not a strawman.' },
      ] },
      { type: 'code', file: 'src/sources/sim.ts · buildStorm() (excerpt)', code: `// One CI failure, seven deliveries: webhook retries share an id, re-runs get new ids.
e('ci-9001', 'ci_failed', 'ci:main', 'github-actions', 'CI failed on main: test (inbox.test.ts)'),  // ×3
...[9002, 9003, 9004, 9005].map((n) => e(\`ci-\${n}\`, 'ci_failed', 'ci:main', 'github-actions', \`CI failed on main (re-run \${n - 9001})\`)),
// Dependabot PRs and its rebase comments.
...[40, 41, 42, 43, 44, 45].map((n) => e(\`dep-pr-\${n}\`, 'pr_opened', \`\${REPO}#\${n}\`, 'dependabot[bot]', \`Bump dependency #\${n}\`)),
// Reaction-only comments.
...['+1', 'same here', 'thanks!', '+1', '👍', 'me too', '+1', 'same here', 'thanks!', '+1'].map(/* … */),
// The agent's own earlier comments coming back.
...[10, 12].map((n) => e(\`self-\${n}\`, 'issue_comment', \`\${REPO}#\${n}\`, 'ambient-agent', 'Re: triage', \`Labelled as bug. \${SELF_MARKER}\`)),` },
      { type: 'links', items: L('openbot', 'openduet') },
    ],
    points: [
      'One worker run per event, all at the same time.',
      'Bots, edits, “+1” and the agent’s own replies each cost a run.',
      'Every result pings you. Evals: 0 of 6.',
    ],
    actions: [['load', 'Load step-1', 1], ['storm'], ['trigger', '+1 comment', 'reaction'], ['trigger', 'Bot comment', 'bot-comment'], ['trigger', 'Own comment', 'self-echo'], ['reset']],
    caption: 'Watch the worker’s “max at once” and the notifications. Every other box is a stub that lets everything through.',
    say: [
      'Paste the step-1 prompt into Claude Code. While it works, storm the stage.',
      'Count the workers and the pings: this is “call the agent on every webhook”.',
      'Ask the room: which of these deserved a model call at all?',
    ],
  },
  {
    id: 'gate', part: 'Build', nav: 'Filter and gate', step: 2,
    eyebrow: 'Step 2 · fixes 1 and 2',
    title: 'Most events need no thinking',
    lede: 'Fix 1 drops the obvious noise in plain code. Fix 2 decides the rest as a cascade: a decision model answers typed questions about every event in milliseconds, and only the events it is unsure about go to an LLM. The same answers route each event to a signal.',
    sections: [
      { type: 'live' },
      { type: 'cards', cols: 3, items: [
        { h: 'The problem in the storm', html: '28 of the 60 events never need a model: 16 from bots, 9 edits, 1 green build, 2 of the agent’s own comments. Another 10 are “+1” and “thanks”.' },
        { h: 'The fix', html: '<b>Prefilter</b>: a pure function over fields the event already carries, with a reason for every drop. <b>Gate</b>: <code>GATE_MODE=decision</code> asks Jev or Clef “act, ignore or ask?” and “CI, issue or PR?”; at ≥ 0.8 confidence that settles it, below it the LLM gate (<code>generateObject</code> + zod) decides. Rules are the fallback.' },
        { h: 'How others do it', html: 'Grok Bot puts a router and a “do I need to bug the user” check in front of its main agent. OpenClaw’s docs keep raw email in an isolated reader, never in the main session. Same idea: cheap judgement first, expensive work later.' },
      ] },
      { type: 'code', file: 'src/prefilter.ts', code: `/** Fix 1: drop noise in plain code, before any model sees it. */
export function prefilter(event: AgentEvent, { selfLogin }: PrefilterOptions): FilterResult {
  if (event.actor.bot) return { keep: false, reason: \`bot: \${event.actor.login}\` };
  if (event.actor.login === selfLogin || event.body?.includes(SELF_MARKER)) {
    return { keep: false, reason: 'its own post' };
  }
  if (event.kind === 'issue_edited') return { keep: false, reason: 'edit, not new work' };
  if (event.kind === 'ci_passed') return { keep: false, reason: 'green build' };
  return { keep: true };
}` },
      { type: 'code', file: 'src/gate.ts (prompt and call)', code: `const PROMPT = \`You are the gate of an ambient engineering agent watching a GitHub repo.
For each event decide:
- "act": real work the agent should do (new issue, red CI, real question)
- "ignore": no work needed (reactions like +1/thanks, chatter)
- "ask": needs a human decision before any work (deletes, force-pushes, anything risky)
Give a reason of at most 8 words for every event.\`;

const { object } = await generateObject({
  model: languageModel(model), // OpenRouter: anthropic/claude-haiku-4.5
  schema: verdictSchema,       // { verdicts: [{ i, action: 'act' | 'ignore' | 'ask', reason }] }
  system: PROMPT,
  prompt: lines.join('\\n'),
});` },
      { type: 'links', items: L('playground', 'grokTalk', 'openclaw', 'aiSdk', 'openrouter') },
    ],
    points: [
      '<code>prefilter.ts</code>: no model, no cost, every drop has a reason.',
      '<code>gate.ts</code>: one small-model call per batch, reasons in the feed.',
      'Evals: <b>noise</b> and <b>cost</b> pass, 2 of 6.',
    ],
    actions: [['load', 'Load step-2', 2], ['storm'], ['trigger', '+1 comment', 'reaction'], ['trigger', 'Bot comment', 'bot-comment'], ['trigger', 'New issue', 'new-issue'], ['reset']],
    caption: 'Grey dots stop at the prefilter, amber dots are ignored by the gate. Only the rest reach a worker.',
    say: [
      'Cheapest fix first: plain code removes the obvious noise for free.',
      'Then a small model, batched. Every verdict carries a reason, so you can audit what it skipped.',
      'Open the dashboard feed and read one reason out loud: it shows the probability and the route.',
    ],
  },
  {
    id: 'decisions', part: 'Build', nav: 'Deep dive: decision models', step: null,
    eyebrow: 'Deep dive · the gate’s model',
    title: 'A gate that answers in probabilities',
    lede: 'An LLM gate writes its verdict as text. A decision model reads the event and typed questions and returns a probability for every allowed answer in one forward pass: it can’t invent a label, it is cheap enough for every event, and the probability says when to ask a bigger model.',
    sections: [
      { type: 'cards', cols: 3, items: [
        { h: 'Typed questions', html: '<code>choice</code> picks one of named options, <code>noul</code> is yes/no, <code>score</code> rates ordered levels. Our gate asks one choice (act, ignore, ask) and three nouls (CI? issue? PR?) per event.' },
        { h: 'Probabilities, not prose', html: 'One forward pass scores every option; no tokens are generated. Cloudflare quotes about 39 ms (Clef-Flash) and 209 ms (Clef) of model time; from a laptop, ten events took about 0.6 s with Clef and about 3 s with the LLM gate. $0.24 per million input tokens.' },
        { h: 'The cascade', html: 'Code drops the noise, the decision model settles what it is sure about, the LLM sees only the rest. The threshold is the dial between cost and caution.' },
      ] },
      { type: 'embed', h: 'Race: ten events, decision model against the LLM gate', src: '/decisions?embed=race', full: '/decisions#h-race', height: 860 },
      { type: 'embed', h: 'Playground: one event, every provider', src: '/decisions?embed=play', full: '/decisions#h-play', height: 720 },
      { type: 'embed', h: 'The storm: pick the threshold', src: '/decisions?embed=storm', full: '/decisions#h-storm', height: 620 },
      { type: 'code', file: 'POST /v1/systemone (Jev) · /ai/run/@cf/cloudflare/clef (Workers AI)', code: `{
  "model": "clef-flash",
  "state": { "kind": "issue_comment", "from": "omar", "body": "CI on main has been red since this morning…" },
  "questions": {
    "action": { "type": "choice", "criteria": { "act": "Real work…", "ignore": "No work needed…", "ask": "Risky…" } },
    "ci":     { "type": "noul", "instructions": "Is this about a failing, flaky or slow build?" }
  }
}
// → { "answers": { "action": { "choice": "act", "confidence": 0.93, "probabilities": {…} }, "ci": { "noul": 0.91 } } }` },
      { type: 'links', items: L('playground', 'clef', 'clefCard', 'jev', 'clefNews') },
    ],
    say: [
      'Playground below the race: same event through Clef, the LLM, and no gate at all. Pick “Comment that is really about CI”.',
      'The comment about CI: kind-based routing sends it to issues, the decision model sends it to CI.',
      'Race 10 events (right here on the slide): the decision model is done before the LLM gate prints its first verdict. Read the cost column out loud.',
      'Run the storm, then drag the threshold: watch how many events would escalate.',
    ],
  },
  {
    id: 'inbox', part: 'Build', nav: 'Coalesce', step: 3,
    eyebrow: 'Step 3 · fix 3',
    title: 'One problem, one piece of work',
    lede: 'The same red build arrives seven times. The inbox keys work by subject, merges what arrives while a worker is busy on it, and treats the same news within five minutes as the same news.',
    sections: [
      { type: 'live' },
      { type: 'cards', cols: 3, items: [
        { h: 'The problem in the storm', html: '“CI failed on main” arrives 7 times: 3 webhook retries share an id, 4 re-runs get new ids. Without keys, seven workers investigate the same build and post seven comments.' },
        { h: 'The fix', html: 'Drop ids already seen. Key work by <code>subject</code> (<code>ci:main</code>, <code>demo/app#12</code>). While a subject is busy, collect new events and hand them over in one follow-up turn. Same subject and kind within 5 minutes: merged.' },
        { h: 'How others do it', html: 'OpenMausBot lets new events join the queued run, up to 20 events. Grok Bot turns “three or four messages very quickly” into one turn. Open Duet doesn’t dedupe webhooks at all.' },
      ] },
      { type: 'code', file: 'src/inbox.ts · offer()', code: `offer(event: AgentEvent): OfferResult {
  const duplicate = this.seen.has(event.id);
  this.seen.add(event.id);
  if (duplicate) return 'merged';
  const key = \`\${event.subject}|\${event.kind}\`;
  const last = this.handledAt.get(key);
  if (last !== undefined && this.options.now() - last < this.options.quietMinutes * 60_000) return 'merged';
  this.handledAt.set(key, this.options.now());
  if (this.busy.has(event.subject)) {
    this.pending.set(event.subject, [...(this.pending.get(event.subject) ?? []), event]);
    return 'merged';
  }
  this.start(event.subject, [event]);
  return 'started';
}` },
      { type: 'links', items: L('openmaus', 'grokTalk', 'openduet') },
    ],
    points: [
      'Subject keys: <code>ci:main</code>, <code>demo/app#12</code>. <code>inbox.ts</code>',
      'Busy subject: new events join the running work.',
      'Evals: <b>duplicates</b> passes, 3 of 6.',
    ],
    actions: [['load', 'Load step-3', 3], ['storm'], ['trigger', 'CI fails', 'ci-failed'], ['trigger', 'PR opened', 'pr-opened'], ['reset']],
    caption: 'Blue dots are merged into work that is already running. Click “CI fails” three times quickly.',
    say: [
      'Same CI failure, seven deliveries. Without keys, seven workers fix the same thing.',
      'Click CI fails three times: one run, the rest merged.',
    ],
  },
  {
    id: 'policy', part: 'Build', nav: 'Sessions, ask vs act', step: 4,
    eyebrow: 'Step 4 · fixes 4 and 5',
    title: 'Fewer workers, fewer pings',
    lede: 'Fix 4 keeps one long-lived session per signal (CI, issues, PRs): runs queue instead of crowding, and the agent remembers yesterday. Fix 5 decides how loud to be from two questions: can it be undone, and how sure is the agent?',
    sections: [
      { type: 'live' },
      { type: 'cards', cols: 3, items: [
        { h: 'The problem', html: 'Even with one run per subject, every run starts cold and every result pings you. The agent can’t tell “labelled an issue” from “wants to merge a PR”.' },
        { h: 'The fix', html: '<b>Sessions</b>: runs for a signal queue behind each other and resume its session. <b>Policy</b>: easy to undo and sure → act and note; easy to undo, unsure → draft; hard to undo → ask. Pings spend a daily budget from <code>memory/preferences.md</code>; the rest wait for 09:00.' },
        { h: 'How others do it', html: 'Grok Bot reaches you only through one SendToUser tool. OpenMausBot holds a result until your chat is idle, and “NOTHING NEW” posts nothing. Long sessions grow context, so OpenBot carries a short “Progress so far” note between runs instead.' },
      ] },
      { type: 'code', file: 'src/policy.ts · decide()', code: `decide(result: WorkerResult): Decision {
  const sure = result.confidence >= SURE;
  if (result.reversible && sure) return { route: 'act', ping: false, why: 'done; easy to undo' };
  if (!result.reversible && !sure) return { route: 'note', ping: false, why: 'unsure and hard to undo' };
  const route = result.reversible ? 'draft' : 'ask';
  const budget = pingBudget(this.readPreferences());
  if (this.sentToday() >= budget) return { route, ping: false, why: \`ping budget (\${budget}/day) used\` };
  return { route, ping: true, why: route === 'ask' ? 'hard to undo; needs a yes' : 'drafted; needs review' };
}` },
      { type: 'prefs' },
      { type: 'links', items: L('playground', 'clef', 'jev', 'grokTalk', 'openmaus', 'openbot') },
    ],
    points: [
      '<code>worker.ts</code>: one session per signal, runs queue.',
      '<code>policy.ts</code>: act, draft, ask or note.',
      'Evals: <b>sessions</b> and <b>pings</b> pass, 5 of 6.',
    ],
    actions: [['load', 'Load step-4', 4], ['storm'], ['reset']],
    caption: 'The policy holds what can wait; only asks and drafts that need you reach the notifications.',
    say: [
      'Sessions: the CI worker remembers the last red build.',
      'The policy is two questions: can it be undone, and how sure is it?',
      'Preferences are plain words in a file. Add the budget line, reset, storm again.',
    ],
  },
  {
    id: 'timers', part: 'Build', nav: 'Timers', step: 5,
    eyebrow: 'Step 5 · timers are signals too',
    title: 'The agent books its own check-backs',
    lede: 'A cron gives the agent a rhythm. The better trick is letting it schedule its next look itself: “CI is still red, check again in ten minutes.” The wakeup comes back as an ordinary event through the same pipeline.',
    sections: [
      { type: 'live' },
      { type: 'cards', cols: 3, items: [
        { h: 'The problem', html: 'A red build is rarely fixed in one go. Someone has to look again later, and nobody does. A fixed cron either polls too often or misses the moment.' },
        { h: 'The fix', html: 'The worker returns <code>wakeupInMinutes</code>; <code>timers.ts</code> stores it in SQLite. Due wakeups become <code>timer</code> events and go through the prefilter, gate and inbox like anything from GitHub. At 09:00 the held items go out as one digest.' },
        { h: 'How others do it', html: 'Claude Code’s <code>/loop</code> lets Claude choose its next interval. Grok Bot routines run on a schedule with the laptop closed. OpenClaw cron jobs pick which session they run in: main, isolated, or a named one.' },
      ] },
      { type: 'code', file: 'src/timers.ts · due()', code: `/** Due wakeups come back as \`timer\` events through the same pipeline as everything else. */
due(): AgentEvent[] {
  return this.store.takeDueWakeups(this.clock.now()).map((w) => ({
    id: \`wakeup-\${w.id}\`,
    source: 'timer',
    kind: 'timer',
    actor: { login: 'clock', bot: false },
    subject: w.subject,
    title: \`Wakeup: \${w.reason}\`,
    at: this.clock.now(),
  }));
}` },
      { type: 'wakeups' },
      { type: 'links', items: L('claudeLoop', 'grokRoutines') },
    ],
    points: [
      '<code>timers.ts</code>: wakeups in SQLite, due ones become events.',
      'The clock is simulated: jump instead of waiting.',
      'Evals: <b>timers</b> passes, 6 of 6.',
    ],
    actions: [['load', 'Load step-5', 5], ['trigger', 'CI fails', 'ci-failed'], ['clock', '+10 min', 10], ['jump', '09:00 digest', '09:00'], ['storm'], ['reset']],
    caption: 'Green dots are wakeups the agent booked for itself, coming back in at the start.',
    say: [
      'The agent drafted a fix and asked to be woken in 10 minutes. Jump the clock.',
      'Wakeups come back as events: same prefilter, gate and inbox.',
      'Jump to 09:00: everything held arrives as one digest.',
    ],
  },

  // ---------------------------------------------------------------- wrap
  {
    id: 'devloop', part: 'Wrap', nav: 'How I build', step: null,
    eyebrow: 'My dev loop · Claude Code',
    title: 'Skills, not prompts',
    lede: 'Everything on these screens was built in Claude Code over a few evenings. Whatever I did twice became a skill: a short file in the repo, reviewed like code, and synced by Ruler to every coding agent I use.',
    sections: [
      { type: 'loop', items: [
        { name: '/proposal', html: 'A one-page plan with pictures before any code. Decide first, then build.', file: '.ruler/skills/proposal' },
        { name: 'Build in worktrees', html: 'One worktree per idea, each with its own agent, port and database, so experiments never collide.', file: '.ruler/skills/worktree' },
        { name: '/preflight', html: 'Type-check, evals and a review of the diff at the same time, before anything is pushed.', file: '.ruler/skills/preflight' },
        { name: '/code-review', html: 'Parallel reviewers; every finding has to point at a line. Running on today’s branch right now.', file: '.ruler/skills/code-review', live: true },
        { name: 'PR, then CI', html: '<code>/pr-description</code> writes it from the diff, <code>/pr-review</code> reviews it in its own worktree, <code>/babysit</code> watches CI until it is green.', file: '.ruler/skills/babysit' },
        { name: '/launch-video', html: 'A script drives the real UI, captions go into the page, the music is the app’s own.', file: '.ruler/skills/launch-video' },
      ] },
      { type: 'cards', cols: 3, items: [
        { h: 'Why a skill', html: 'A prompt lives in my head; a skill lives in the repo. It is versioned with the code, reviewed in PRs, and the same for Claude Code, Codex, Cursor and OpenCode (<code>pnpm ruler</code>).' },
        { h: 'Short and checkable', html: 'Each skill is a page or less and ends with how to check the result: evals pass, a screenshot at two widths, a file and line for every finding.' },
        { h: 'Two users', html: 'The same files run headless. The agent calls <code>/code-review</code>, <code>/fix-ci</code> and <code>/triage-issue</code> on its own when a signal passes the gate.' },
      ] },
      { type: 'code', file: '.ruler/skills/preflight/SKILL.md (excerpt)', code: `2. Run these at the same time (parallel tool calls or subagents, not one after another):
   - pnpm typecheck
   - pnpm eval: the contract. The passing count must not drop compared with main.
   - The code-review skill on the diff, in a subagent, asked for blockers only.
3. Fix what is clearly caused by this diff. Never edit evals/ or fixtures/ to make a check pass.` },
      { type: 'links', items: L('skills', 'ruler', 'claudeHeadless') },
    ],
    say: [
      'Kick off /code-review on the branch first; it runs while I talk through the loop.',
      'Skills are files: diffable, reviewable, the same for me and for the agent.',
      'Come back to the review: read one finding and the line it points at.',
    ],
  },
  {
    id: 'ship', part: 'Wrap', nav: 'Ship it', step: null,
    eyebrow: 'Ship: review → PR',
    title: 'Same skills, two users',
    lede: 'The branch becomes a reviewed PR with the skills I use every day. The twist: the ambient agent calls the same skills when it works on its own. Written once, used by me in the terminal and by the agent in the background.',
    sections: [
      { type: 'table', label: 'Skills used in the demo',
        head: ['Skill', 'By me, in the terminal', 'By the agent, on its own'],
        rows: [
          ['<code>/code-review</code>', 'Parallel reviewers, findings sorted into blockers and suggestions, each checked against the source', 'Reviews a PR when <code>pr_opened</code> passes the gate: <code>claude -p "/code-review #42"</code>'],
          ['<code>/triage-issue</code>', 'Label, find duplicates, ask for a repro', 'Runs on <code>issue_opened</code> in the issues session'],
          ['<code>/fix-ci</code>', 'Read the failing job, draft a fix PR', 'Runs on <code>ci_failed</code>, then books a wakeup to check again'],
          ['<code>/preflight</code>', 'Type-check, evals and a blockers-only review, in parallel, before pushing', 'The same checks before it opens a fix PR'],
          ['<code>/pr-review</code>', 'Check out a PR in a worktree, run the checks, post one review with inline comments', 'Reviews PRs that pass the gate; comments only, never approves'],
          ['<code>/add-signal</code>', 'Teach the agent a new source, with an eval that proves it', '—'],
          ['<code>/proposal</code>, <code>/launch-video</code>', 'Plan pages and the demo video, from real UI', '—'],
        ] },
      { type: 'chart' },
      { type: 'links', items: L('claudeHeadless', 'ruler', 'claudeAction') },
    ],
    actions: [['link', 'Side by side dashboard', '/dashboard'], ['clear-scores']],
    say: [
      'These numbers are from the storms we ran today, not a slide.',
      'Skills live in .ruler/skills; pnpm ruler syncs them to every agent.',
    ],
  },
  {
    id: 'blueprint', part: 'Wrap', nav: 'Blueprint + Q&A', step: null,
    eyebrow: 'Blueprint · take it home',
    title: 'Build your own: eight questions',
    lede: 'The code is small on purpose. What carries over to your product are the answers to these questions; the workshop repo answers each one in a single file.',
    sections: [
      { type: 'questions', items: [
        ['Sources', 'Which events wake it, and which do you poll instead of receive? Do timers count?', 'sources/'],
        ['Shape filter', 'What can plain code drop using fields the source already gives you?', 'prefilter.ts'],
        ['Gate', 'Which typed questions settle an event? Which model answers them, and below what confidence does a bigger model take over?', 'gate.ts'],
        ['Subject key', 'What makes two events the same piece of work?', 'inbox.ts'],
        ['Sessions', 'One per signal, per subject, or fresh per run? What carries over between runs?', 'worker.ts'],
        ['Policy', 'Which actions can be undone? How sure is sure enough? What always needs a yes?', 'policy.ts'],
        ['Budget', 'How many pings a day, written where the person can change it?', 'memory/preferences.md'],
        ['Timers', 'What should the agent look at again, and who decides when?', 'timers.ts'],
      ] },
      { type: 'links', items: L('playground', 'clef', 'jev', 'grokTalk', 'pulse', 'grokRoutines', 'claudeAction', 'claudeLoop', 'claudeHeadless', 'ruler', 'aiSdk', 'openrouter') },
    ],
    say: ['Clone it, change a fix, run pnpm eval.', 'Questions.'],
  },
];

// Presenter-only cues for /presenter (your laptop screen, not the projector): when each chapter should
// start (minutes into the talk) and what to do outside the slide (Claude Code, the dashboard tab, music).
window.STAGE_PRESENTER = {
  title: { min: 0, do: [
    'Before people sit down: dashboard tab open, Start sound once (the browser needs that click), Reset all.',
    'Start the timer here when you begin talking.',
  ] },
  signals: { min: 2, do: ['Keep it short: three questions, trigger, where the work runs, how it reaches you.'] },
  wild: { min: 3, do: ['Pick one example to tell properly (Grok Bot), skim the rest.'] },
  compare: { min: 5, do: ['Point at the last row: that is what we build today.'] },
  lessons: { min: 7, do: ['Each card links to the step that fixes it; don’t open them now.'] },
  anatomy: { min: 8, do: ['Load the finished agent, one storm: show the calm end state first.', 'Reset before moving on.'] },
  v0: { min: 10, do: [
    'Paste the step-1 prompt into Claude Code (Copy below).',
    'While it works: Dashboard → Storm all. Music goes from ambient to techno: “this is a naive ambient agent”.',
    'Back on stage: Load step-1, Storm. Point at the notifications filling up.',
  ] },
  gate: { min: 18, do: [
    'Paste the step-2 prompt.',
    'Load step-2, Storm: dots fall at the filter; read one gate reason aloud (it shows the probability).',
    'Dashboard → Storm all: compare the two columns, finished is audibly calmer.',
  ] },
  decisions: { min: 24, do: [
    'Race 10 events (button below): Clef is done before the LLM’s first verdict. Read the cost column.',
    'Playground: “Comment that is really about CI”, kind says issues, the model says CI.',
    'Skip the storm frame if you are behind.',
  ] },
  inbox: { min: 27, do: ['Paste the step-3 prompt.', 'Load step-3, CI fails three times: one run, not three.'] },
  policy: { min: 32, do: ['Paste the step-4 prompt.', 'Load step-4, Storm. Add the budget line, Reset, Storm again: count the pings.'] },
  timers: { min: 37, do: ['Paste the step-5 prompt.', 'Load step-5, CI fails, then +10 min: the wakeup comes back as an event. Then 09:00 digest.'] },
  devloop: { min: 40, do: [
    'In Claude Code, in the workshop repo: /code-review on the branch you built today. Let it run.',
    'Open .ruler/skills/preflight/SKILL.md in the editor: it fits on one screen.',
    'Back to the review: read one finding aloud with its file:line.',
  ] },
  ship: { min: 44, do: [
    'Dashboard → Storm all, then Solo naive and Solo finished: same storm, chaos vs calm.',
    'Optional finale: run /dj in Claude Code, then DJ on the dashboard.',
  ] },
  blueprint: { min: 48, do: ['Repo: github.com/yavorsky/ambient-agents-workshop (make it public first).', 'Q&A from 52.'] },
};
