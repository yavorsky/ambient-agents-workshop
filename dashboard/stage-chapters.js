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
  aiSdkTools: ['AI SDK: tools and the agent loop', 'https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling'],
  openrouterRouting: ['OpenRouter: provider routing and fallbacks', 'https://openrouter.ai/docs/features/provider-routing'],
  aiSdkProviders: ['AI SDK providers', 'https://ai-sdk.dev/providers/ai-sdk-providers'],
  aiGateway: ['Vercel AI Gateway', 'https://vercel.com/docs/ai-gateway'],
  mcpSpec: ['Model Context Protocol', 'https://modelcontextprotocol.io/'],
  githubMcp: ['GitHub MCP server', 'https://github.com/github/github-mcp-server'],
  githubWebhooks: ['GitHub webhooks', 'https://docs.github.com/en/webhooks'],
  githubWebhookSignature: ['Validating webhook deliveries', 'https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries'],
  ghWebhook: ['gh webhook forward (cli/gh-webhook)', 'https://github.com/cli/gh-webhook'],
  aiSdkAgents: ['AI SDK: agents and the tool loop', 'https://ai-sdk.dev/docs/agents/overview'],
  claudeAgentSdk: ['Claude Agent SDK', 'https://platform.claude.com/docs/en/agent-sdk/overview'],
  openaiAgents: ['OpenAI Agents SDK (Python)', 'https://openai.github.io/openai-agents-python/'],
  openaiAgentsJs: ['OpenAI Agents SDK (TypeScript)', 'https://openai.github.io/openai-agents-js/'],
  langgraph: ['LangGraph', 'https://langchain-ai.github.io/langgraph/'],
  mastra: ['Mastra', 'https://mastra.ai/docs'],
  chatgptMemory: ['ChatGPT memory (OpenAI help)', 'https://help.openai.com/en/articles/8590148-memory-faq'],
  lettaDocs: ['Letta docs', 'https://docs.letta.com'],
  mem0Docs: ['mem0 docs', 'https://docs.mem0.ai'],
  zepDocs: ['Zep docs', 'https://help.getzep.com'],
  graphitiRepo: ['Graphiti (open source)', 'https://github.com/getzep/graphiti'],
  langmem: ['LangMem', 'https://github.com/langchain-ai/langmem'],
  supermemory: ['Supermemory docs', 'https://supermemory.ai/docs'],
  writerRouting: ['Where signals go: five agents compared with Writer’s Operators', '/writer/operator-signal-routing-comparison.html'],
  e2b: ['E2B sandboxes', 'https://e2b.dev'],
  vercelSandbox: ['Vercel Sandbox', 'https://vercel.com/docs/vercel-sandbox'],
  cfSandbox: ['Cloudflare Sandbox', 'https://developers.cloudflare.com/sandbox/'],
  daytonaPricing: ['Daytona pricing', 'https://www.daytona.io/pricing'],
  e2bPricing: ['E2B pricing', 'https://e2b.dev/pricing'],
  vercelSandboxPricing: ['Vercel Sandbox pricing and limits', 'https://vercel.com/docs/sandbox/pricing'],
  vercelDrives: ['Vercel Drives: persistent storage for agents', 'https://vercel.com/kb/guide/persistent-storage-with-vercel-drives'],
  cfContainersPricing: ['Cloudflare Containers pricing (Sandbox runs on it)', 'https://developers.cloudflare.com/containers/platform/pricing/'],
  claudeSandboxing: ['Claude Code sandboxing', 'https://code.claude.com/docs/en/sandboxing'],
  vercelCron: ['Vercel Cron Jobs', 'https://vercel.com/docs/cron-jobs'],
  cfCron: ['Cloudflare Cron Triggers', 'https://developers.cloudflare.com/workers/configuration/cron-triggers/'],
  ghaSchedule: ['GitHub Actions: schedule', 'https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule'],
  crontabGuru: ['crontab.guru', 'https://crontab.guru/'],
  openclaw: ['OpenClaw (code at 313b84fd)', 'https://github.com/openclaw/openclaw/tree/313b84fd'],
  openmaus: ['OpenMausBot (code at 6c95883)', 'https://github.com/milind-soni/OpenMausBot/tree/6c95883'],
  openbot: ['OpenBot by CopilotKit (code at bd4dc94)', 'https://github.com/CopilotKit/openbot/tree/bd4dc94'],
  openduet: ['Open Duet (code at e2e0696)', 'https://github.com/Anil-matcha/open-duet/tree/e2e0696'],
  playground: ['Decision models: explainer and playground', '/decisions'],
  museBuiltin: ['What is Meta Muse? (Built In)', 'https://builtin.com/articles/meta-muse'],
  museWired: ['Muse keeps pages about your contacts (WIRED report, summary)', 'https://letsdatascience.com/news/meta-muse-creates-profiles-of-users-contacts-15585c25'],
  nanoMuse: ['nanoMuse: open-source personal agent, memory as files', 'https://github.com/nano-muse/nanoMuse'],
  claudeMemoryTool: ['Claude memory tool', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool'],
  claudeCodeMemory: ['Claude Code memory (CLAUDE.md)', 'https://code.claude.com/docs/en/memory'],
  letta: ['Letta (MemGPT)', 'https://github.com/letta-ai/letta'],
  mem0: ['mem0', 'https://github.com/mem0ai/mem0'],
  graphiti: ['Graphiti (Zep)', 'https://github.com/getzep/graphiti'],
  memsearch: ['memsearch (Zilliz)', 'https://github.com/zilliztech/memsearch'],
  daytonaFs: ['Daytona sandbox file system', 'https://www.daytona.io/docs/typescript-sdk/file-system'],
  clef: ['Clef on Workers AI', 'https://developers.cloudflare.com/workers-ai/models/clef/'],
  clefCard: ['Clef model card (open weights)', 'https://huggingface.co/Cloudflare/clef'],
  jev: ['Jev quickstart (TypeSafe)', 'https://docs.typesafe.ai/introduction/quickstart'],
  clefNews: ['Cloudflare open-sources decision models', 'https://www.infoq.com/news/2026/10/clef-decision-models/'],
  site: ['yavorsky.org', 'https://yavorsky.org/'],
  github: ['GitHub · yavorsky', 'https://github.com/yavorsky'],
  x: ['X · @yavorsky_', 'https://x.com/yavorsky_'],
  bluesky: ['Bluesky · yavorsky.bsky.social', 'https://yavorsky.bsky.social/'],
  linkedin: ['LinkedIn · yvrsky', 'https://linkedin.com/in/yvrsky'],
  instagram: ['Instagram · aqson', 'https://www.instagram.com/aqson/'],
  writer: ['WRITER: the enterprise AI platform I work on', 'https://writer.com/'],
  workshopRepo: ['The workshop repo', 'https://github.com/yavorsky/ambient-agents-workshop'],
  harness: ['The Harness Effect (arXiv, Jul 2026)', 'https://arxiv.org/abs/2607.06906'],
  skills: ['The skills in this repo', 'https://github.com/yavorsky/ambient-agents-workshop/tree/main/.ruler/skills'],
  evalsRun: ['evals/run.ts: the six checks', 'https://github.com/yavorsky/ambient-agents-workshop/blob/main/evals/run.ts'],
  stormFixture: ['fixtures/storm.json: the 60 events', 'https://github.com/yavorsky/ambient-agents-workshop/blob/main/fixtures/storm.json'],
  stormSource: ['src/sources/sim.ts: buildStorm() makes the storm', 'https://github.com/yavorsky/ambient-agents-workshop/blob/main/src/sources/sim.ts'],
};
const L = (...keys) => keys.map((k) => LINKS[k]);

window.STAGE_AGENDA = [
  [0, 6, 'Hook + demo', 'talk'],
  [6, 9, 'Anatomy · models', 'talk'],
  [9, 15, 'Build the agent: chat + tools', 'live'],
  [15, 20, 'MCP · GitHub signals', 'live'],
  [20, 27, 'Watches, break it · evals', 'live'],
  [27, 35, 'Fixes: filter · gate · coalesce · policy', 'live'],
  [35, 38, 'Sessions · before vs after', 'live'],
  [38, 41, 'Wake-ups · timers', 'live'],
  [41, 45, 'Memory · DB or files', 'live'],
  [45, 50, 'Ship: review → PR', 'live'],
  [50, 52, 'Blueprint', 'talk'],
  [52, 55, 'Q&A', 'talk'],
];

window.STAGE_CHAPTERS = [
  // ---------------------------------------------------------------- intro
  {
    id: 'title', part: 'Intro', nav: 'Welcome', step: null,
    eyebrow: 'Workshop · 55 minutes · Art Yavorsky',
    title: 'Agents that work while you don’t',
    lede: 'Most agents wait for a prompt. Today we build one, a chat agent with tools, and then take the prompt away: it watches a GitHub repo and a clock, decides what is worth doing, does it, and pings a person only when it should. We give it signals the naive way, break it with a storm of 60 real-looking events, and fix it step by step, each fix a lesson from running an ambient agent in production.',
    sections: [
      { type: 'agenda' },
      { type: 'cards', cols: 3, items: [
        { h: 'You leave with', html: 'A working repo: the agent, a 60-event storm, six evals, and every step as a git tag you can check out.' },
        { h: 'Built live', html: 'In Claude Code, one prompt per step. If a step runs long, I load the next tag and keep going.' },
        { h: 'Take it home', html: 'Every step is a git tag in <a href="https://github.com/yavorsky/ambient-agents-workshop" target="_blank" rel="noopener">github.com/yavorsky/ambient-agents-workshop</a>: check out <code>step-3</code>, run it, break it, then compare with <code>step-4</code>.' },
      ] },
    ],
    say: [
      'Who has an agent that runs without being asked? Who trusts it to?',
      'I build ambient agents for a living; today is a small, readable version of what I learned.',
      'Agenda: 10 minutes of context, 40 minutes of building, 5 minutes of questions.',
    ],
  },
  {
    id: 'about', part: 'Intro', nav: 'About me', step: null,
    eyebrow: 'About me',
    title: 'Art Yavorsky',
    lede: 'Software engineer and engineering manager. I create developer tools that make the impossible feel routine and routine feel fun.',
    sections: [
      { type: 'cards', cols: 3, items: [
        { h: 'Wix · 2018–2023', html: 'Engineering leadership.' },
        { h: 'Netflix · 2023–2025', html: 'Engineering leadership.' },
        { h: 'Now · WRITER', html: 'Building ambient agents that run in production at <a href="https://writer.com/" target="_blank" rel="noopener">writer.com</a>. This workshop is the small, readable version of what I learned.' },
      ] },
      { type: 'cards', cols: 4, items: [
        { h: 'The Harness Effect', html: 'Research, Jul 2026: how orchestration design sets the token economics of enterprise agentic AI.' },
        { h: 'unbuilt.app', html: 'The fastest open-source web stack detection tool.' },
        { h: 'Babel', html: 'Open-source contributor to the JavaScript compiler.' },
        { h: 'simr.app', html: 'A cleaner way to cook, without the life stories.' },
      ] },
      { type: 'links', items: L('writer', 'site', 'github', 'x', 'bluesky', 'linkedin', 'harness') },
    ],
    say: [
      'Thirty seconds: tools for developers at Wix and Netflix, now agents that run without being asked.',
      'The paper is why I care about the gate: most of an agent’s cost is decided before the model does any work.',
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
        { h: 'What nobody has solved', html: 'Lee Robinson named it in the talk: knowing “when the agent is silent or when it kind of bugs you.” Step 6 is our attempt.' },
      ] },
      { type: 'links', items: L('playground', 'clef', 'jev', 'grokTalk', 'grokPost', 'openclaw', 'openmaus', 'openbot', 'openduet', 'writerRouting') },
    ],
    say: [
      'Only one of the five does signal work in the main chat, and it blocks your next message.',
      'The last row is what we build today; each column is one of our steps.',
      'Long-lived sessions remember, but grow context and keep injections around; that is the trade-off.',
    ],
  },
  {
    id: 'lessons', part: 'Intro', nav: 'Seven lessons', step: null,
    eyebrow: 'What we will build in',
    title: 'Seven lessons, one per step',
    lede: 'Each fix is something that breaks in every ambient agent sooner or later, and each has a product above that already handles it. Click a step to jump there.',
    sections: [
      { type: 'lessons', items: [
        { title: 'Drop on shape before any model sees it', source: 'Bots, edits, green builds and its own posts are visible in fields every event already carries. Plain code, no model, a reason for every drop.', go: 'gate', chip: 'step-4 · prefilter' },
        { title: 'Judge with a decision model, escalate when unsure', source: 'A decision model (Jev, Clef) answers typed questions about every event with probabilities in milliseconds; only the unsure ones go to an LLM. Grok Bot runs a “do I need to bug the user” check before its main agent.', go: 'decisions', chip: 'step-4 · gate' },
        { title: 'Dedupe, then merge bursts', source: 'Grok Bot: a router “dedupes that and figures out how to put it into the conversation”; “three or four messages very quickly” become one turn.', go: 'inbox', chip: 'step-5 · inbox' },
        { title: 'Work in side sessions that report results', source: 'Grok Bot helpers return only their result; OpenMausBot posts one line, or nothing. Our worker keeps one session per signal and reports a summary, not its tool calls.', go: 'policy', chip: 'step-6 · sessions' },
        { title: 'Decide whether to bug the person', source: 'The unsolved part. We make it a policy (can it be undone × how sure) and a ping budget written in plain words.', go: 'policy', chip: 'step-6 · policy' },
        { title: 'Let the agent book its own wakeups', source: 'Claude Code /loop chooses its next interval; Grok Bot routines run on a schedule with the laptop closed.', go: 'timers', chip: 'step-7 · timers' },
        { title: 'Remember in files, read on demand', source: 'Meta Muse keeps pages about the people in your life; nanoMuse and Claude’s memory tool keep memory as files the agent reads when it needs them. Our chat sees an index, not the event stream.', go: 'memory', chip: 'step-8 · memory' },
      ] },
    ],
    say: ['Cheap things first: each later box sees fewer events.'],
  },
  {
    id: 'anatomy', part: 'Intro', nav: 'Anatomy and stack', step: null,
    eyebrow: 'Anatomy + my stack',
    title: 'Five boxes, one file each',
    lede: 'Signals come in, plain code throws most away, a small model decides on the rest, an inbox merges repeats, and only then does a real agent session do work. A policy decides whether you hear about it. This is the map; we start with the agent box on its own, as a chat.',
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
    actions: [],
    caption: 'The boxes we fill in, one step at a time. Everything except the agent is a pass-through stub for now.',
    say: [
      'The agent box is a normal agent: a model, tools, a loop. We build that first and talk to it.',
      'Then everything around it is about one question: what happens when nobody is typing?',
    ],
  },

  // ---------------------------------------------------------------- build
  {
    id: 'models', part: 'Build', nav: 'Models and providers', step: null,
    eyebrow: 'Before we build · which model, through what',
    title: 'One API, many models',
    lede: 'An agent is only as good as the model behind it, and the best model changes every few months. So the code never names a provider: it asks for a model by id, and one line decides where the call goes. We use three kinds of model, each where it pays off.',
    sections: [
      { type: 'flow', lanes: [
        { title: "One call, any provider", nodes: [
          { t: "Our code", s: "<code>streamText({ model: languageModel(id) })</code>" },
          { t: "src/models.ts", s: "picks the route from the env" },
          { t: "OpenRouter", s: "one key, one bill", tone: "accent" },
          { t: "Anthropic · OpenAI · Google · …", s: "the model you named" },
        ] },
        { title: "Three tiers, each where it pays", nodes: [
          { t: "Decision model", s: "Clef / Jev: probabilities, milliseconds, every event", tone: "ok" },
          { t: "Small LLM", s: "Haiku: only the unsure events, one call per batch", arrow: "→ unsure" },
          { t: "Capable LLM", s: "Sonnet: the chat and the work, with tools", tone: "accent" },
        ] },
      ] },
      { type: 'code', file: 'src/models.ts · the only place that knows about providers', code: `export const MODEL_TIERS = {
  gate: process.env.MODEL_GATE ?? 'anthropic/claude-haiku-4.5',     // every batch: cheap and fast
  worker: process.env.MODEL_WORKER ?? 'anthropic/claude-sonnet-5',  // does the work
  chat: process.env.MODEL_CHAT ?? 'anthropic/claude-sonnet-5',      // talks to you, uses tools
} as const;

export function languageModel(id: string): LanguageModel {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return id;                        // no key: the id goes to Vercel AI Gateway
  openrouter ??= createOpenRouter({ apiKey });
  return openrouter.chat(id);                    // with a key: OpenRouter
}` },
      { type: 'cards', cols: 3, items: [
        { h: 'OpenRouter', html: 'One key and one bill for models from many providers, behind one API. A model is a string like <code>anthropic/claude-sonnet-5</code>; switching is an env var, not a code change. Each model page shows its price per token.' },
        { h: 'AI SDK', html: 'The calls in this repo (<code>streamText</code>, <code>generateObject</code>, tools, <code>stopWhen</code>) are the same whatever the provider. OpenRouter, Anthropic, OpenAI or Vercel AI Gateway are each one provider package away.' },
        { h: 'Direct, when it matters', html: 'Going straight to a provider gets you its newest features first. A router gets you choice and one place to switch. Here the router wins: the talk swaps models live.' },
        { h: 'Small model: the gate', html: 'Haiku decides act / ignore / ask for a batch of events. It runs on every batch, so it has to be cheap; it never does the work.' },
        { h: 'Big model: chat and worker', html: 'Sonnet calls tools in a loop and writes the answers. Fewer calls, each one worth it.' },
        { h: 'Not an LLM: decision models', html: 'Clef or Jev answer typed questions with probabilities in milliseconds, no text generated. The gate asks them first and the LLM only when they are unsure (step 4).' },
      ] },
      { type: 'links', items: L('openrouter', 'openrouterRouting', 'aiSdkProviders', 'aiGateway', 'playground') },
    ],
    points: [
      'Models are strings; <code>src/models.ts</code> picks the route.',
      'Cheap model for every event, capable model for the work.',
      'Change a model with an env var: <code>MODEL_CHAT=…</code>.',
    ],
    actions: [],
    caption: '',
    say: [
      'The code asks for a model by name; where the call goes is one function.',
      'Three tiers: a decision model, a small LLM, a capable LLM. Each where it pays off.',
      'If one provider is down on the day, I change one env var.',
    ],
  },
  {
    id: 'chat', part: 'Build', nav: 'The agent: chat', step: 1,
    eyebrow: 'Step 1 · a regular agent first',
    title: 'An agent is a model, tools and a loop',
    lede: 'Before it can work while you don’t, it has to work while you do. A chat agent: you type, it calls tools until it knows enough, then answers. It can read the repo, GitHub and its own skills. This conversation is the main thread: from the next step on, the agent will also write into it on its own.',
    sections: [
      { type: 'embed', h: 'Talk to the stage agent', src: '/chat?embed=1&instance=stage', full: '/chat?instance=stage', height: 520 },
      { type: 'code', file: 'src/chat.ts · send()', code: `const result = streamText({
  model: languageModel(this.deps.model),   // OpenRouter: anthropic/claude-sonnet-5
  system: this.deps.instructions(),
  messages: conversation,                  // the whole conversation, tool calls included
  tools: this.deps.tools,                  // read_file, search, github_issues, load_skill, …
  stopWhen: isStepCount(10),               // the loop: call tools until it can answer
});
for await (const part of result.fullStream) yield toChatPart(part);
this.sessions.set(sessionId, [...conversation, ...(await result.responseMessages)]);` },
      { type: 'cards', cols: 3, items: [
        { h: 'The loop', html: 'The model answers or asks for a tool. We run the tool, hand back the result, and go again, up to 10 times. That is all an agent loop is.' },
        { h: 'The tools', html: '<code>src/tools.ts</code>: list and read files, search, GitHub issues, PRs and CI runs through <code>gh</code>, load a skill. Read-only for now.' },
        { h: 'The catch', html: 'It only works while someone is typing. CI breaks at 3am, an issue lands while you sleep: nobody asks, so nothing happens. Next: tell it once what to watch for, and let events ask.' },
      ] },
      { type: 'table', label: 'The same loop, other ways to get it', head: ['', 'What you write', 'The loop', 'Tools and models'], rows: [
        ['<b>Vercel AI SDK</b> (here)', 'TypeScript: <code>streamText</code> + <code>tool()</code> + zod', '<code>stopWhen: isStepCount(10)</code>; you own the loop and the conversation', 'your functions; any provider (here OpenRouter)'],
        ['<b>Claude Agent SDK</b>', 'TypeScript or Python', 'Claude Code’s own loop as a library: sessions, subagents, permissions', 'built-in files, bash and web tools, plus MCP; Claude models'],
        ['<b>OpenAI Agents SDK</b>', 'Python or TypeScript', 'agents that hand off to each other, with guardrails and tracing', 'function tools and MCP; OpenAI models first'],
        ['<b>LangGraph</b>', 'Python or JS', 'a graph of nodes with saved state you can resume', 'LangChain tools; any provider'],
        ['<b>Mastra</b>', 'TypeScript, on the AI SDK', 'agents plus workflows, memory and evals in one framework', 'AI SDK providers'],
        ['<b>Claude Code headless</b>', 'a shell command: <code>claude -p</code>', 'the whole agent, run per task (our worker in claude mode)', 'Claude Code’s tools, skills and MCP'],
      ] },
      { type: 'links', items: L('aiSdkTools', 'openrouter', 'aiSdkAgents', 'claudeAgentSdk', 'openaiAgents', 'openaiAgentsJs', 'langgraph', 'mastra') },
    ],
    points: [
      '<code>chat.ts</code>: <code>streamText</code> with tools and <code>stopWhen</code>, one conversation: the main thread.',
      'Tools and skills are the agent’s hands and job descriptions.',
      'No evals yet: they measure the ambient part, which starts next.',
    ],
    actions: [['load', 'Load step-1', 1], ['link', 'Diff step-0 → step-1', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-0...step-1'], ['reset']],
    caption: 'The pipeline is still all stubs: this step is only the agent box, driven by you.',
    say: [
      'Paste the step-1 prompt into Claude Code. While it works, load step-1 and ask the agent something.',
      'Open a tool call and show the raw result: the model read that, then answered.',
      'Then: “what if nobody asks?” That is the rest of the talk.',
    ],
  },
  {
    id: 'tools', part: 'Build', nav: 'Tools: its hands', step: 1,
    eyebrow: 'Step 1 · how a model does things',
    title: 'A tool is a name, a description, a schema and a function',
    lede: 'The model never runs anything. It reads the tool list (names, descriptions, input schemas), and when it needs one it answers with a tool call: a name and JSON input. Our code checks the input, runs the function and hands the result back. The loop goes again until the model answers in words.',
    sections: [
      { type: 'flow', lanes: [
        { title: "One turn of the agent loop", loop: "↺ repeats until the model answers in words, at most 10 steps (stopWhen)", nodes: [
          { t: "You", s: "a message in the thread" },
          { t: "Model", s: "reads the tool list: names, descriptions, schemas", tone: "accent" },
          { t: "Tool call", s: "<code>read_file { path: \"prompts/step-2.md\" }</code>" },
          { t: "Our code", s: "checks the input, <code>inside()</code>, runs <code>execute</code>", tone: "ok" },
          { t: "Result", s: "text back to the model" },
          { t: "Answer", s: "streamed into the thread" },
        ] },
      ] },
      { type: 'code', file: 'src/tools.ts · two of the agent’s tools', code: `read_file: tool({
  description: 'Read a text file in the repo.',            // the model picks tools by this text
  inputSchema: z.object({ path: z.string() }),             // and must send input that fits this
  execute: async ({ path }) => clip(readFileSync(inside(path), 'utf8')),  // our code, our rules
}),
github_issues: tool({
  description: 'List GitHub issues (open by default).',
  inputSchema: z.object({ state: z.enum(['open', 'closed', 'all']).default('open') }),
  execute: async ({ state }) => gh(deps.repo, ['issue', 'list', '--state', state, '--limit', '20']),
}),` },
      { type: 'code', file: 'src/tools.ts · the guard: the model asks, the code decides', code: `/** Paths stay inside the checkout. */
function inside(path: string): string {
  const root = process.cwd();
  const full = resolve(root, path);
  if (full !== root && !full.startsWith(\`\${root}/\`)) throw new Error('path is outside the repo');
  return full;
}` },
      { type: 'code', file: 'src/chat.ts · what one turn streams back', code: `for await (const part of result.fullStream) {
  if (part.type === 'tool-call') yield { t: 'tool', name: part.toolName, input: part.input };       // the model asks
  else if (part.type === 'tool-result') yield { t: 'tool-result', name: part.toolName, output: … }; // we answer
  else if (part.type === 'text-delta') yield { t: 'text', text: part.text };                        // it talks
}` },
      { type: 'cards', cols: 3, items: [
        { h: 'Read the repo', html: '<code>list_files</code>, <code>read_file</code>, <code>search</code> (git grep). Paths can’t leave the checkout.' },
        { h: 'Read GitHub', html: '<code>github_issues</code>, <code>github_issue</code>, <code>github_prs</code>, <code>github_runs</code>, through the <code>gh</code> CLI. Read-only: it can look, not change anything.' },
        { h: 'Skills are tools too', html: '<code>load_skill</code> returns a SKILL.md: instructions, loaded only when the job needs them. The same files Claude Code uses.' },
        { h: 'Descriptions are prompts', html: 'A vague description gets the wrong tool. “Load one before doing that job” is why it reads <code>fix-ci</code> before answering about CI.' },
        { h: 'Errors are answers', html: 'A failing <code>gh</code> call returns its error as text. The model reads it and tries something else, instead of the turn crashing.' },
        { h: 'Next: tools that change things', html: '<code>watch</code> writes your standing instructions to a file. That is where the agent stops being only a chat.' },
      ] },
      { type: 'links', items: L('aiSdkTools') },
    ],
    points: [
      'Tool = description + zod schema + <code>execute</code>.',
      'The model asks; our code checks and runs.',
      'One turn can be several tool calls, up to <code>stopWhen</code>.',
    ],
    actions: [['load', 'Load step-1', 1], ['reset']],
    caption: 'Ask the agent something on the previous slide and open a tool call: that grey block is the whole contract.',
    say: [
      'The model never touches the disk. It writes a request; we decide whether to run it.',
      'Read one tool definition aloud: the description is literally what the model reads.',
      'Skills are just a tool that returns instructions. Same files as Claude Code.',
    ],
  },
  {
    id: 'sandboxes', part: 'Build', nav: 'Sandboxes', step: null,
    eyebrow: 'Where the agent’s hands work',
    title: 'Sandboxes: give the hands a room of their own',
    lede: 'Tools run code: they read files, call gh, maybe run tests. In production that happens in a sandbox: a throwaway machine per session with its own files, shell and network rules, and only the credentials that session needs. Today we keep it simpler and local: read-only tools, a path guard, an allowlist for Claude Code, and a git worktree per agent.',
    sections: [
      { type: 'flow', lanes: [
        { title: "Production: a room per session", nodes: [
          { t: "Agent loop", s: "decides what to run" },
          { t: "Sandbox", s: "container / microVM: files, shell, egress rules", tone: "accent" },
          { t: "Scoped token", s: "one repo, one permission set", tone: "ok" },
          { t: "Thrown away", s: "memory and the PR are kept outside", tone: "muted" },
        ] },
        { title: "Here: simpler, local", nodes: [
          { t: "Agent loop", s: "the same code" },
          { t: "Guards", s: "read-only tools, <code>inside()</code>, gh allowlist", tone: "warn" },
          { t: "Worktree per agent", s: "own folder, port, database" },
          { t: "Your laptop", s: "fine for a talk, not for public input", tone: "muted" },
        ] },
      ] },
      { type: 'how',
        problem: 'An agent that can run a shell can do anything your user can: read secrets, push to main, curl anywhere. One prompt injection in an issue body is enough to try. You want the blast radius to be one disposable box, not your laptop or your cloud account.',
        steps: [
          'Start a sandbox per session (container or microVM), from an image with the repo and tools.',
          'Mount only what the job needs; give it a token scoped to one repo and one permission set.',
          'Limit egress: the package registry and the GitHub API, nothing else.',
          'Run the tools inside it; stream results back to the agent loop.',
          'Throw it away at the end; keep what matters (memory files, the PR) outside.',
        ],
        code: [
          ['src/tools.ts · inside()', 'here: paths cannot leave the checkout'],
          ['src/runners.ts · ALLOWED_TOOLS', 'here: Claude Code may only run listed gh commands'],
          ['scripts/wt.sh', 'here: every agent in its own worktree, port and database'],
          ['src/memory.ts · DaytonaMemoryStore', 'step 8: memory files in a Daytona sandbox when DAYTONA_API_KEY is set'],
        ] },
      { type: 'code', file: 'src/runners.ts · what the Claude Code worker may run, and nothing else', code: `const ALLOWED_TOOLS = [
  'Read', 'Grep', 'Glob',
  // No issue create: it reads public input, so it may answer, label and review, never open new threads.
  'Bash(gh issue view:*)', 'Bash(gh issue list:*)', 'Bash(gh issue comment:*)', 'Bash(gh issue edit:*)',
  'Bash(gh pr view:*)', 'Bash(gh pr diff:*)', 'Bash(gh pr comment:*)', 'Bash(gh pr review:*)',
  'Bash(gh run view:*)', 'Bash(gh run list:*)',
];` },
      { type: 'cards', cols: 3, items: [
        { h: 'Hosted sandboxes', html: 'Daytona, E2B, Vercel Sandbox, Cloudflare Sandbox: an API call starts a fresh machine with files, a shell and a network policy, in about a second.' },
        { h: 'Claude Code’s own', html: 'Claude Code can sandbox its bash tool: filesystem and network limits enforced by the OS, so an allowlist is not the only line of defence.' },
        { h: 'Why not today', html: 'A sandbox per session adds startup time, an account and one more thing to fail on stage. The guards here show the idea; the sandbox is where it goes in production.' },
      ] },
      { type: 'links', items: L('daytonaFs', 'e2b', 'vercelSandbox', 'cfSandbox', 'claudeSandboxing') },
    ],
    points: [
      'Production: one disposable sandbox per session.',
      'Here: read-only tools, a path guard, an allowlist, a worktree per agent.',
      'Same loop either way; only where the hands run changes.',
    ],
    actions: [],
    caption: '',
    say: [
      'Tools run code. Where that code runs is the security model.',
      'Here it is simpler: read-only tools, a path guard, an allowlist. In production: a sandbox per session.',
    ],
  },
  {
    id: 'mcp', part: 'Build', nav: 'MCP: hands, not ears', step: null,
    eyebrow: 'Before signals · where tools come from',
    title: 'MCP gives an agent hands, not ears',
    lede: 'MCP (Model Context Protocol) is a standard way to plug tools into any agent: a server lists its tools, a client (Claude Code, Cursor, your agent) calls them. GitHub runs one, so any MCP client can read issues and open PRs without writing the tools. But MCP is a call the agent makes while it is already running. Nothing in it wakes the agent when an issue opens. For that you need a signal, and that is the next step.',
    sections: [
      { type: 'flow', lanes: [
        { title: "Ears: something happened → start a turn", nodes: [
          { t: "Webhook · poll · timer", s: "GitHub calls, we ask, the clock rings" },
          { t: "AgentEvent", s: "one shape for every source", tone: "accent" },
          { t: "Pipeline", s: "prefilter → gate → inbox → worker" },
        ] },
        { title: "Hands: inside a turn → do something", nodes: [
          { t: "Agent loop", s: "the model asks for a tool" },
          { t: "In-process tools", s: "<code>src/tools.ts</code>: our code, our guards", tone: "ok" },
          { t: "or an MCP server", s: "GitHub, Linear, Sentry: shared by every agent", tone: "accent", arrow: "or" },
          { t: "GitHub", s: "issues, PRs, CI" },
        ] },
      ] },
      { type: 'code', file: 'Claude Code · add GitHub’s hosted MCP server (from GitHub’s install guide)', code: `claude mcp add-json github '{"type":"http","url":"https://api.githubcopilot.com/mcp","headers":{"Authorization":"Bearer '"$GITHUB_PAT"'"}}'` },
      { type: 'cards', cols: 3, items: [
        { h: 'Hands: tools and MCP', html: 'The agent decides to act and calls something: read an issue, open a PR, query a database. Our <code>src/tools.ts</code> is the same idea, in-process; an MCP server is the same list, shared across agents.' },
        { h: 'Ears: signals', html: 'Something happens and the agent should find out: a webhook delivery, a poll that sees something new, a timer that comes due. The world calls the agent, or the agent checks on a clock.' },
        { h: 'You need both', html: 'An agent with only hands waits for a prompt. With only ears it notices everything and can do nothing. An ambient agent is ears that start a turn, and hands that do the work.' },
        { h: 'When to use MCP', html: 'Many agents need the same tools, or someone else maintains them (GitHub, Linear, Sentry). Then a server beats copying tool code into every agent.' },
        { h: 'When not to', html: 'A tool that is three lines and lives with this agent, or needs a tight guard like <code>inside()</code>. In-process is simpler to read and to secure.' },
        { h: 'Our choice here', html: 'In-process tools on the <code>gh</code> CLI, so every line is on screen. Swapping in GitHub’s MCP server changes where the tools come from, not the loop.' },
      ] },
      { type: 'links', items: L('mcpSpec', 'githubMcp') },
    ],
    points: [
      'MCP: tools any agent can call. Pull, not push.',
      'Signals: webhooks, polling, timers. They start the turn.',
      'Hands + ears = an ambient agent.',
    ],
    actions: [],
    caption: '',
    say: [
      'Show of hands: who has MCP servers in their editor? Those are hands.',
      'None of them tells your agent that CI just broke. That needs ears.',
      'Next step: GitHub calls us.',
    ],
  },
  {
    id: 'github', part: 'Build', nav: 'GitHub signals', step: 2,
    eyebrow: 'Step 2 · ears: GitHub calls you, or you ask',
    title: 'Signals in: webhooks, and polling as a fallback',
    lede: 'Two ways to hear GitHub. A webhook: GitHub posts every issue, PR, comment and CI run to a URL the moment it happens, signed with a shared secret. Polling: the agent asks every few seconds what is new. Either way it becomes the same event. For now the agent only records what it hears; the pipeline comes next.',
    sections: [
      { type: 'live' },
      { type: 'embed', h: 'The agent’s app: events arrive on the right', src: '/chat?embed=1&instance=stage', full: '/chat?instance=stage', height: 460 },
      { type: 'code', file: 'src/sources/github.ts · never trust a delivery you did not check', code: `export function verifySignature(secret: string, body: string, header: string | undefined): boolean {
  if (!header?.startsWith('sha256=')) return false;
  const expected = Buffer.from(\`sha256=\${createHmac('sha256', secret).update(body).digest('hex')}\`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);  // constant time
}` },
      { type: 'code', file: 'src/sources/github.ts · one delivery → the events it means', code: `if (name === 'workflow_run' && p.action === 'completed' && run.conclusion === 'failure') {
  return [{ id: \`run-\${run.id}\`, source: 'github', kind: 'ci_failed',
    subject: \`ci:\${run.head_branch}\`, title: \`\${run.name} failure on \${run.head_branch}\`, … }];
}
// issues → issue_opened / issue_edited · pull_request → pr_opened · issue_comment → issue_comment / pr_comment
// ids match the poller's, so the same issue heard both ways is one event` },
      { type: 'cards', cols: 3, items: [
        { h: 'Webhook', html: 'Instant, and GitHub does the work. Needs a URL GitHub can reach and a secret. In production, the repo settings point at your server.' },
        { h: 'On a laptop: gh webhook forward', html: 'A GitHub CLI extension (<code>cli/gh-webhook</code>) that creates a temporary webhook on the repo and relays its deliveries to <code>localhost</code>. No tunnel, no public URL.' },
        { h: 'Polling', html: '<code>gh api</code> for new issues, comments and runs every 10–20 s. Works from anywhere, costs a few API calls, adds up to one interval of delay. The first poll only records what exists.' },
        { h: 'The signature', html: 'HMAC-SHA256 of the raw body with the secret, compared in constant time. A forged or replayed-with-changes delivery gets a 401 before anything parses it.' },
        { h: 'One event shape', html: 'Webhook, poller, simulator and timers all produce <code>AgentEvent</code>: kind, actor, subject, title, body. Everything after the source never knows which one it was.' },
        { h: 'How others do it', html: 'Bots built on GitHub Apps take webhooks; CI dashboards poll. Many do both: webhooks for speed, a slow poll to catch what a dropped delivery missed.' },
      ] },
      { type: 'links', items: L('githubWebhooks', 'githubWebhookSignature', 'ghWebhook') },
    ],
    points: [
      '<code>POST /webhooks/github</code>: check the signature, map, ingest.',
      'No public URL? Poll, or <code>gh webhook forward</code>.',
      'Same <code>AgentEvent</code> from every source.',
    ],
    actions: [['load', 'Load step-2', 2], ['link', 'Diff step-1 → step-2', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-1...step-2'], ['webhook', 'Signed issue', 'issue'], ['webhook', 'CI failed', 'ci'], ['webhook', 'PR opened', 'pr'], ['webhook', 'Forged signature', 'issue-bad'], ['reset']],
    caption: 'Each button sends a real-shaped GitHub delivery, signed with the webhook secret. Watch it arrive under Events; the forged one gets a 401.',
    say: [
      'Webhooks are GitHub calling us; polling is us calling GitHub. Same event either way.',
      'Send a signed issue: it shows up as heard, nothing more yet.',
      'Send the forged one: 401. Anything that reaches the agent is something GitHub signed.',
    ],
  },
  {
    id: 'v0', part: 'Build', nav: 'Watches, then break it', step: 3,
    eyebrow: 'Step 3 · from chat to ambient',
    title: 'Watch for this, and tell me in the thread',
    lede: 'This is the step that makes it ambient. You tell it once what you care about: “watch for PRs about cats”. From then on events start its turns instead of you, and what it does lands in the same thread you chat in. The obvious wiring runs on every event and reports every result. With one event it looks fine. Then we replay a recorded busy hour: 60 events in ten seconds, and your conversation drowns.',
    sections: [
      { type: 'live' },
      { type: 'embed', h: 'The main thread: what it tells you', src: '/chat?embed=1&instance=stage', full: '/chat?instance=stage', height: 520 },
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
      'Every result lands in your thread, watched or not. Evals: 0 of 6.',
    ],
    actions: [['load', 'Load step-3', 3], ['link', 'Diff step-2 → step-3', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-2...step-3'], ['trigger', 'Cat PR', 'cat-pr'], ['storm'], ['trigger', '+1 comment', 'reaction'], ['trigger', 'Bot comment', 'bot-comment'], ['trigger', 'Own comment', 'self-echo'], ['reset']],
    caption: 'Watch the thread on the right and the worker’s “max at once”. Every other box is a stub that lets everything through, including what you never asked to watch.',
    say: [
      'In the thread: “Watch for PRs about cats.” Then Cat PR: one event, one report in the thread. Looks fine.',
      'Then storm: the thread fills with reports about everything, cats or not.',
      'This is “call the agent on every webhook” with a chat on top: your conversation is gone.',
      'Ask the room: which of these deserved a model call at all?',
    ],
  },
  {
    id: 'evals', part: 'Build', nav: 'Evals: the to-do list', step: 3,
    eyebrow: 'How we know a step works',
    title: 'Evals: replay the storm, check what happened',
    lede: 'Watching a storm is a demo, not a test. The evals replay the same 60 events through a fresh agent in one process: a simulated worker, a rules gate, a fast clock, no API calls, about two seconds. Then six checks look at what actually happened. Right now all six are red, and that red list is the plan for the rest of the talk.',
    sections: [
      { type: 'live' },
      { type: 'how',
        problem: 'A storm on screen shows the agent once, by eye. We need the same answer every run, in seconds, without API keys, so Claude Code can check its own work.',
        steps: [
          '<b>Same input:</b> 60 recorded events in <code>fixtures/storm.json</code> (bots, edits, “+1”s, a CI failure that repeats, real issues).',
          '<b>Fresh agent, nothing real:</b> in-memory SQLite, a clock we move by hand, a simulated worker that records every run, the rules gate.',
          '<b>Replay:</b> ingest all 60, wait until nothing is gating or working, then jump the clock 11 minutes and tick, for the timers check.',
          '<b>Six checks on what happened:</b> noise, cost, duplicates, sessions, pings, timers. Each passes or says the number that is off. About 2 s.',
        ],
        code: [
          ['evals/run.ts', ' the replay and the six checks; run with pnpm eval'],
          ['fixtures/storm.json', ' the 60 events (pnpm fixtures rebuilds it)'],
          ['src/sources/sim.ts · buildStorm()', ' the same storm the Storm button sends'],
        ] },
      { type: 'code', file: 'evals/run.ts · a fresh agent, nothing real', code: `const store = new Store(':memory:');                 // no database on disk
const clock = new Clock(); clock.jumpTo('10:00');     // time we control
const worker = new RecordingWorker({ mode: 'sim', simSpeed: 0.01, … });  // records every run
const agent = new Agent({
  store, clock, worker, timers,
  policy: new Policy(() => 'At most 3 pings a day. Never merge without asking.', store, clock),
  gate: { mode: 'rules', model: 'rules' },            // deterministic: no model in the loop
  …
});
for (const event of storm) agent.ingest({ ...event, at: clock.now() });
await settle(agent);                                  // until nothing is gating or working` },
      { type: 'code', file: 'evals/run.ts · two of the six checks', code: `['noise: bots, edits and its own posts never reach a worker', () => {
  const bad = handled.filter((e) => e.actor.bot || e.kind === 'issue_edited' || e.body?.includes(SELF_MARKER));
  return bad.length === 0 || \`\${bad.length} noise events reached a worker\`;
}],
['duplicates: one CI failure, at most two runs', () => {
  const ci = worker.recorded.filter((r) => r.events[0]?.subject === 'ci:main').length;
  return ci <= 2 || \`\${ci} runs for the same CI failure\`;
}],` },
      { type: 'code', file: 'evals/run.ts · time travel for the timers check', code: `clock.advance(11);   // 11 minutes later, instantly
agent.tick();        // due wakeups fire as events
await settle(agent);
timerResult = s.timersFired > 0 || 'red CI never booked a check-back';` },
      { type: 'cards', cols: 3, items: [
        { h: 'Check behaviour, not words', html: 'No LLM judging an LLM. Each check counts what reached a worker, how many runs, how many pings. Same input, same answer, every time, so a red check means the code changed.' },
        { h: 'One check per lesson', html: '<b>noise</b> and <b>cost</b> turn green at step 4, <b>duplicates</b> at 5, <b>sessions</b> and <b>pings</b> at 6, <b>timers</b> at 7. Each failure message says what went wrong, in numbers.' },
        { h: 'Claude Code’s finish line', html: 'Every step prompt ends with “<code>pnpm eval</code> must pass”. The agent that writes the code runs the checks itself, so “done” means something it can verify.' },
      ] },
      { type: 'links', items: L('evalsRun', 'stormFixture', 'stormSource') },
    ],
    points: [
      '<code>pnpm eval</code>: the storm, replayed in-process, about 2 s, no keys.',
      'Six checks, one per thing that breaks. Red is the to-do list.',
      'Live coding? Run the same checks on Claude’s version: <code>pnpm wt eval stage</code>.',
    ],
    actions: [['load', 'Load step-3', 3], ['reset']],
    caption: 'Press E (Run evals): six red checks against the naive agent, each with the number that failed.',
    say: [
      'A storm on screen convinces people; it does not convince CI. This does.',
      'Walk the setup: in-memory store, a clock we control, a worker that records. Then two checks.',
      'Run it: 0 of 6. Read the failures aloud: “95 noise events reached a worker”, “7 runs for the same CI failure”, “128 pings with a budget of 3”.',
    ],
  },
  {
    id: 'gate', part: 'Build', nav: 'Filter and gate', step: 4,
    eyebrow: 'Step 4 · fixes 1 and 2',
    title: 'Most events need no thinking',
    lede: 'Fix 1 drops the obvious noise in plain code. Fix 2 decides the rest as a cascade: a decision model answers typed questions about every event in milliseconds, and only the events it is unsure about go to an LLM. The same call checks the event against your watches: real work that matches no watch is not your business, so it never reaches the thread.',
    sections: [
      { type: 'live' },
      { type: 'how',
        problem: "In the storm 28 of 60 events never need a model: 16 from bots, 9 edits, 1 green build, 2 of the agent’s own replies. 10 more are “+1” and “thanks”. And most of the rest are not about anything you asked to watch. Each one costs a worker run and a report in your thread.",
        steps: [
          "<b>Prefilter, plain code:</b> drop bot actors, the agent’s own posts (its login or the hidden marker), issue edits and green builds. Every drop gets a reason.",
          "<b>Batch:</b> collect what is left for <code>gateWindowMs</code> (400 ms), then decide the batch at once.",
          "<b>Ask the decision model</b> per event, one call: act / ignore / ask, which signal (ci, issues, prs), and one yes/no per watch.",
          "<b>Cascade:</b> confidence ≥ 0.6 settles it. Below that, one LLM call decides the unsure ones. No keys at all: rules.",
          "<b>Watches:</b> act or ask with no watch ≥ 0.5 becomes ignore, and the reason names the closest watch.",
        ],
        code: [
          ["src/prefilter.ts:12 · prefilter()", "the plain-code drops"],
          ["src/pipeline.ts · ingest() → flush()", "batching, then one gate call per batch"],
          ["src/gate.ts:34 · gate()", "the cascade: decision model → LLM → rules"],
          ["src/gate.ts:127 · decisionVerdicts()", "probabilities, threshold, watch questions (:124)"],
          ["src/gate.ts:55 · requireWatch()", "no watch, no work"],
          ["src/questions.ts:5 · GATE_QUESTIONS", "the typed questions"],
        ] },
      { type: 'cards', cols: 3, items: [
        { h: 'The fix', html: '<b>Prefilter</b>: a pure function over fields the event already carries, with a reason for every drop. <b>Gate</b>: <code>GATE_MODE=decision</code> asks Jev or Clef “act, ignore or ask?” and “CI, issue or PR?”; at ≥ 0.6 confidence that settles it, below it the LLM gate (<code>generateObject</code> + zod) decides. Rules are the fallback.' },
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
      'Watches: one yes/no question each. No match, no report.',
      'Evals: <b>noise</b> and <b>cost</b> pass, 2 of 6.',
    ],
    actions: [['load', 'Load step-4', 4], ['link', 'Diff step-3 → step-4', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-3...step-4'], ['storm'], ['trigger', 'Cat PR', 'cat-pr'], ['trigger', 'Other PR', 'pr-opened'], ['trigger', '+1 comment', 'reaction'], ['trigger', 'New issue', 'new-issue'], ['reset']],
    caption: 'Grey dots stop at the prefilter, amber dots are ignored by the gate (noise, or no watch). Only the rest reach a worker and the thread.',
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
    id: 'inbox', part: 'Build', nav: 'Coalesce', step: 5,
    eyebrow: 'Step 5 · fix 3',
    title: 'One problem, one piece of work',
    lede: 'The same red build arrives seven times. The inbox keys work by subject, merges what arrives while a worker is busy on it, and treats the same news within five minutes as the same news. The thread does the same: one entry per subject that updates, not a new message for every run.',
    sections: [
      { type: 'live' },
      { type: 'how',
        problem: "“CI failed on main” arrives 7 times: 3 webhook retries share an id, 4 re-runs get new ids. Without a key, 7 workers investigate the same failure and the thread gets 7 messages. Events that arrive while a worker is already on a subject start a second worker.",
        steps: [
          "<b>Seen this id?</b> Drop it: that is a retry of the same delivery.",
          "<b>Same subject and kind within 5 minutes?</b> Same news: merge it.",
          "<b>Subject busy?</b> Queue the event on that subject. When the run ends, everything queued goes in one follow-up run.",
          "<b>Otherwise</b> start one run for the subject.",
          "<b>In the thread</b>, the same rule: a report on a subject that already has an entry updates it, keeps the old text as history and moves it to the bottom.",
        ],
        code: [
          ["src/inbox.ts:26 · offer()", "ids, the quiet window (:32), busy subjects"],
          ["src/inbox.ts:46 · start()", "the follow-up run with everything queued"],
          ["src/thread.ts:44 · report()", "one entry per subject"],
          ["src/types.ts · AgentEvent.subject", "the key: ci:main, owner/repo#12"],
        ] },
      { type: 'cards', cols: 3, items: [
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
      'The thread groups by subject: one entry per PR or build, with its history.',
      'Evals: <b>duplicates</b> passes, 3 of 6.',
    ],
    actions: [['load', 'Load step-5', 5], ['link', 'Diff step-4 → step-5', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-4...step-5'], ['storm'], ['trigger', 'CI fails', 'ci-failed'], ['trigger', 'PR opened', 'pr-opened'], ['reset']],
    caption: 'Blue dots are merged into work that is already running. Click “CI fails” three times quickly.',
    say: [
      'Same CI failure, seven deliveries. Without keys, seven workers fix the same thing.',
      'Click CI fails three times: one run, the rest merged.',
    ],
  },
  {
    id: 'policy', part: 'Build', nav: 'Sessions, ask vs act', step: 6,
    eyebrow: 'Step 6 · fixes 4 and 5',
    title: 'Fewer workers, fewer pings',
    lede: 'Fix 4 keeps one long-lived session per signal (CI, issues, PRs): runs queue instead of crowding, and the agent remembers yesterday. Fix 5 decides how loud to be from two questions: can it be undone, and how sure is the agent?',
    sections: [
      { type: 'live' },
      { type: 'how',
        problem: "Even with one run per subject, 14 runs start at once, each cold, and every result lands in your thread. “Labelled an issue” is as loud as “wants to merge a PR”, so you stop reading.",
        steps: [
          "<b>One session per signal:</b> runs for ci, issues and prs queue behind each other and resume that signal’s session, so the agent remembers the last red build.",
          "<b>Two questions per result:</b> can it be undone, and is it sure (confidence ≥ 0.7)?",
          "Undoable and sure → <b>act</b>, quietly: no ping, a line in the thread if it matched a watch, and the digest. Not undoable and unsure → <b>note</b> (digest). Undoable and unsure → <b>draft</b>, tell you. Not undoable and sure → <b>ask</b>, with Yes / No.",
          "<b>Budget:</b> “At most N pings a day” from <code>preferences.md</code>; over budget, everything waits for the digest.",
          "<b>Your answer</b> becomes an <code>answer</code> event on the same subject and skips the gate.",
        ],
        code: [
          ["src/worker.ts:26 · run()", "a promise chain per signal; session id stored as session:<signal>"],
          ["src/policy.ts:24 · decide()", "act / draft / ask / note"],
          ["src/policy.ts:8 · pingBudget()", "reads the budget from plain words"],
          ["src/pipeline.ts · deliver() / answer()", "asks wait in the thread; answers come back as events"],
          ["memory/preferences.md", "the contract between you and the policy"],
        ] },
      { type: 'cards', cols: 3, items: [
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
      'An ask waits in the thread; your Yes comes back in as an event.',
      'Evals: <b>sessions</b> and <b>pings</b> pass, 5 of 6.',
    ],
    actions: [['load', 'Load step-6', 6], ['link', 'Diff step-5 → step-6', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-5...step-6'], ['storm'], ['trigger', 'Cat PR', 'cat-pr'], ['reset']],
    caption: 'Drafts and asks ping you; asks come with Yes and No. Quiet work on something you watch is a line in the thread, without a ping. Everything else waits for the 09:00 digest.',
    say: [
      'Sessions: the CI worker remembers the last red build.',
      'The policy is two questions: can it be undone, and how sure is it?',
      'Preferences are plain words in a file. Add the budget line, reset, storm again.',
    ],
  },
  {
    id: 'sessions', part: 'Build', nav: 'Sessions and the thread', step: null,
    eyebrow: 'How the worker works · and when it bothers you',
    title: 'One session per signal, one thread for you',
    lede: 'Behind the gate there are three long-lived worker sessions, one per signal: CI, issues, PRs. Each keeps its own context across runs, so the CI session remembers yesterday’s red build. Every run ends in a result, and the policy decides what the main thread hears: a ping, a quiet line, the 09:00 digest, or a question with Yes and No.',
    sections: [
      { type: 'flow', lanes: [
        { title: 'CI session (fix-ci)', nodes: [
          { t: 'ci:main failed ×7', s: 'retries and re-runs' },
          { t: 'Inbox', s: 'one run, the rest merged', tone: 'ok' },
          { t: 'Session ci', s: 'resumes its context, runs the skill', tone: 'accent' },
          { t: 'Result', s: '“drafted a fix PR, check again in 10 min”' },
          { t: 'Draft → ping', s: 'in the thread now; a wakeup is booked', tone: 'warn' },
        ] },
        { title: 'Issues session (triage-issue)', nodes: [
          { t: 'Issue #13 opened', s: '“Login broken on Safari”' },
          { t: 'Gate', s: 'matches “New issues that need triage”', tone: 'ok' },
          { t: 'Session issues', s: 'labels, asks for repro steps', tone: 'accent' },
          { t: 'Result', s: 'easy to undo, sure' },
          { t: 'Act → quiet', s: 'a line in the thread (watched), and the digest', tone: 'ok' },
        ] },
        { title: 'PRs session (code-review)', nodes: [
          { t: 'Cat PR #52', s: 'matches “PRs about cats”' },
          { t: 'Session prs', s: 'reviews: no blockers', tone: 'accent' },
          { t: 'Result', s: '“merge?” is hard to undo' },
          { t: 'Ask → Yes / No', s: 'waits in the thread', tone: 'warn' },
          { t: 'Your Yes', s: 'comes back as an event, same session goes ahead', tone: 'ok' },
        ] },
      ] },
      { type: 'table', label: 'The policy: two questions decide whether to bother you', head: ['', 'Sure (≥ 0.7)', 'Not sure'], rows: [
        ['<b>Easy to undo</b>', '<b>act</b>: done quietly. A line in the thread if you watch it; the digest.', '<b>draft</b>: done as a draft, <b>ping</b> you to review.'],
        ['<b>Hard to undo</b>', '<b>ask</b>: <b>ping</b> with Yes / No, wait for you.', '<b>note</b>: nothing done, it goes in the digest.'],
      ] },
      { type: 'how',
        problem: 'Forty workers that each start cold and each report straight to you are a crowd shouting in one room. You stop listening, and none of them remembers what the others did.',
        steps: [
          'The gate picks the signal for each event: ci, issues or prs (from the decision model’s answer).',
          'Runs for the same signal queue behind each other: at most three workers, one per signal.',
          'Each run resumes its signal’s session (<code>claude -p --resume</code>), so context carries over.',
          'The result says what was done, whether it can be undone, and how sure it is.',
          'The policy turns that into ping, quiet line, digest or ask; the budget in <code>preferences.md</code> caps the pings.',
        ],
        code: [
          ['src/worker.ts:26 · run()', 'a promise chain per signal; session id kept as session:<signal>'],
          ['src/runners.ts · runClaude()', '<code>claude -p --resume</code> with the signal’s skill'],
          ['src/policy.ts:24 · decide()', 'the 2×2 above'],
          ['src/pipeline.ts · handle() / deliver()', 'result → policy → thread, digest or ask'],
          ['src/notify.ts · send()', 'pings and watched lines go into the thread'],
        ] },
      { type: 'links', items: L('writerRouting') },
    ],
    points: [
      'Three sessions, not forty workers.',
      'Every result goes through one policy before it reaches you.',
      'You answer in the thread; the answer goes back to the same session.',
    ],
    actions: [['load', 'Load step-6', 6], ['storm'], ['trigger', 'Cat PR', 'cat-pr'], ['reset']],
    caption: 'Storm and watch the worker box: never more than three at once, one per signal.',
    say: [
      'Three sessions, each with a memory of its own. Not a worker per event.',
      'Every result meets the same two questions: can it be undone, and how sure is the agent?',
      'This is the part nobody has solved; ours is two questions and a budget in plain words.',
    ],
  },
  {
    id: 'payoff', part: 'Build', nav: 'Before vs after', step: null,
    eyebrow: 'The payoff · same storm, both agents',
    title: 'Same storm, before and after',
    lede: 'Everything since step 3 in one picture. The naive agent and the one we just built (the stage agent, now at step 6) get the same 60 events. One wakes a worker for every event and reports everything. The other drops noise in code, asks a decision model, merges repeats, works one session per signal, and decides what you hear.',
    sections: [
      { type: 'flow', lanes: [
        { title: 'Naive (step 3): every event wakes the agent', nodes: [
          { t: '60 events', s: 'plus its own replies coming back' },
          { t: '~128 worker runs', s: 'one per event, ~50 at the same time', tone: 'warn' },
          { t: '~128 reports', s: 'everything lands in your thread', tone: 'warn' },
        ] },
        { title: 'Finished: the fixes in order', nodes: [
          { t: '60 events', s: 'the same storm' },
          { t: 'Prefilter', s: '~40 dropped in plain code: bots, edits, its own posts', tone: 'ok' },
          { t: 'Gate', s: '~15 ignored by the decision model, or no watch matches', tone: 'ok' },
          { t: 'Inbox', s: 'repeats merged by subject', tone: 'ok' },
          { t: '~14 runs', s: 'one session per signal, 3 at a time', tone: 'accent' },
          { t: 'A few reports', s: 'asks and drafts; the rest waits for 09:00', tone: 'accent' },
        ] },
      ] },
      { type: 'table', label: 'Measured in today’s rehearsal (same storm, simulated worker)', head: ['', 'Naive (step 3)', 'After the fixes (step 6)', 'What did it'], rows: [
        ['Worker runs', '128', '13–14', 'prefilter, gate, inbox'],
        ['Workers at the same time', '56', '3', 'one session per signal'],
        ['Reports that pinged you', '128', '4–6', 'policy and its budget'],
        ['Held for the 09:00 digest', '0', '9–10', 'policy'],
        ['Evals passing', '0 of 6', '5 of 6', 'timers come next'],
      ] },
      { type: 'chart' },
    ],
    points: [
      'Same 60 events, ~10x fewer runs, ~20x fewer pings.',
      'Every number comes from a fix you saw: filter, gate, merge, sessions, policy.',
      'Hear it: the dashboard plays each agent’s load as music.',
    ],
    actions: [['link', 'Open the dashboard', '/dashboard']],
    caption: '',
    say: [
      'Same storm, two agents. On the left everything we had at step 3, on the right everything since.',
      'Switch to the dashboard: Storm all. Then Solo naive, then Solo stage. You can hear the difference.',
      'Back here: the chart has every step we stormed today, side by side.',
    ],
  },
  {
    id: 'wakeups', part: 'Build', nav: 'How an agent wakes up', step: null,
    eyebrow: 'Before timers · what starts a turn',
    title: 'Every turn starts with something waking the agent',
    lede: 'A chat agent wakes when you type. An ambient agent has more alarms: something happened somewhere, something is due, or it promised to look again. Each one becomes the same event, and the same pipeline decides whether it is worth a turn.',
    sections: [
      { type: 'flow', lanes: [
        { title: "Four alarms", nodes: [
          { t: "Push", s: "webhook · your message · your Yes", tone: "accent" },
          { t: "Pull", s: "poll GitHub every 10 s", arrow: "·" },
          { t: "Schedule", s: "09:00 digest · cron", arrow: "·" },
          { t: "Self-booked", s: "“check ci:main in 10 min” · your reminder", tone: "ok", arrow: "·" },
        ] },
        { title: "One door in", nodes: [
          { t: "AgentEvent", s: "kind, subject, title, reason", tone: "accent" },
          { t: "Prefilter → gate → inbox", s: "the same rules for every alarm" },
          { t: "Worker or the thread", s: "reminders skip straight to you", tone: "ok" },
        ] },
      ] },
      { type: 'how',
        problem: 'Without its own alarms an agent forgets. “CI is still running, I will check in 10 minutes” is a promise nobody keeps: there is no prompt in 10 minutes, and a webhook only fires when something else changes.',
        steps: [
          '<b>Push</b>: someone calls the agent. Webhooks (step 2), a chat message (step 1), your Yes on an ask (step 6).',
          '<b>Pull</b>: the agent asks on a clock. Polling GitHub every 10 s (step 2).',
          '<b>Schedule</b>: fixed times. The 09:00 digest, a nightly cron.',
          '<b>Self-booked</b>: the agent asks to be woken about one subject (“check ci:main in 10 min”). Step 7.',
          'All four become an <code>AgentEvent</code> and go through the same prefilter, gate and inbox.',
        ],
        code: [
          ['src/server.ts · POST /webhooks/github', 'push'],
          ['src/sources/github.ts · GitHubPoller', 'pull'],
          ['src/pipeline.ts · tick()', 'schedule: due wakeups and the 09:00 digest'],
          ['src/main.ts:93 · setInterval(() => agent.tick(), 1000)', 'the heartbeat'],
          ['src/timers.ts · schedule() / due()', 'self-booked (step 7)'],
        ] },
      { type: 'cards', cols: 3, items: [
        { h: 'Cron is not enough', html: 'A schedule wakes the agent to scan everything; most runs find nothing. A self-booked wakeup is about one subject, with the reason attached.' },
        { h: 'One door in', html: 'A wakeup is a <code>timer</code> event. It can be filtered, merged and gated like a webhook, so a wakeup about a build that already went green is dropped, not re-run.' },
        { h: 'How others do it', html: 'Claude Code’s /loop picks its own next interval; scheduled agents run routines on a cron with the laptop closed. Same idea: the agent owns its alarm clock.' },
      ] },
    ],
    points: [
      'Push, pull, schedule, self-booked: four alarms.',
      'All four arrive as the same event.',
      'Next: the agent books its own.',
    ],
    actions: [],
    caption: '',
    say: [
      'What wakes your agent? If the answer is only “me”, it is a chat.',
      'Four alarms, one door in. Next step: the agent sets its own alarm.',
    ],
  },
  {
    id: 'timers', part: 'Build', nav: 'Timers', step: 7,
    eyebrow: 'Step 7 · timers are signals too',
    title: 'The agent books its own check-backs',
    lede: "Two kinds of alarm clock, one mechanism. The agent books its own wakeups (“CI is still red, look again in ten minutes”), and you book reminders in the chat (“remind me in 30 minutes to review the cat PR”). Both are a row in SQLite with a time and a reason; a heartbeat checks every second, and whatever is due comes back as an event.",
    sections: [
      { type: 'live' },
      { type: 'flow', lanes: [
        { title: 'The agent books its own wakeup', nodes: [
          { t: 'CI fails', s: 'session ci drafts a fix' },
          { t: 'Result', s: '<code>wakeupInMinutes: 10</code>, “check ci:main again”', tone: 'accent' },
          { t: 'SQLite row', s: 'time, subject, reason; survives a restart' },
          { t: 'Heartbeat', s: '<code>tick()</code> every second: anything due?' },
          { t: 'timer event', s: 'same prefilter, gate, inbox', tone: 'ok' },
          { t: 'Session ci again', s: '“the retry passed” → thread', tone: 'accent' },
        ] },
        { title: 'You book a reminder', nodes: [
          { t: '“Remind me in 10 min…”', s: 'in the chat' },
          { t: 'remind tool', s: 'the same table, reason “Reminder: …”', tone: 'accent' },
          { t: 'Heartbeat', s: 'due' },
          { t: '⏰ in the thread', s: 'no filter: you asked for it', tone: 'ok' },
        ] },
        { title: 'A fixed time', nodes: [
          { t: '09:00', s: 'on the agent clock' },
          { t: 'Digest', s: 'everything the policy held, one message', tone: 'ok' },
        ] },
      ] },
      { type: 'how',
        problem: "An agent that only reacts forgets its promises: “check again in 10 minutes” never happens, because nothing prompts it in 10 minutes and no webhook fires while nothing changes. And you cannot ask it to remind you of anything.",
        steps: [
          "<b>Booking:</b> a worker result may say <code>wakeupInMinutes</code>; the chat’s <code>remind</code> tool books one for you. Either way: <code>timers.schedule(subject, minutes, reason)</code>, one row in SQLite.",
          "<b>Heartbeat:</b> every second <code>agent.tick()</code> asks <code>timers.due()</code> for rows whose time has passed.",
          "<b>Self-booked wakeup:</b> becomes a <code>timer</code> event on the same subject and goes through the prefilter, gate and inbox like a webhook.",
          "<b>Your reminder:</b> goes straight to the thread as “⏰ Reminder: …”. Nobody filters what you asked for.",
          "<b>Fixed time:</b> at 09:00 the policy’s held items go out as one digest. The clock is simulated: we jump instead of waiting.",
        ],
        code: [
          ["src/timers.ts · schedule() / due()", "book, and find what is due"],
          ["src/timers.ts · reminderTools()", "the chat’s remind tool"],
          ["src/pipeline.ts · tick()", "the heartbeat’s work: wakeups, reminders, 09:00"],
          ["src/main.ts · setInterval(() => agent.tick(), 1000)", "the heartbeat itself"],
          ["src/store.ts · wakeups table", "survives a restart"],
        ] },
      { type: 'embed', h: 'Ask for a reminder, then press +10 min', src: '/chat?embed=1&instance=stage', full: '/chat?instance=stage', height: 440 },
      { type: 'code', file: 'src/timers.ts · the chat’s remind tool books the same row the agent books for itself', code: `remind: tool({
  description: 'Set a reminder for the person. It comes back into this thread when due. …',
  inputSchema: z.object({ what: z.string(), inMinutes: z.number().positive().optional(), at: z.string().regex(/^\\d{1,2}:\\d{2}$/).optional() }),
  execute: async ({ what, inMinutes, at }) => {
    const minutes = inMinutes ?? (at ? timers.minutesUntil(at) : undefined);
    timers.schedule('reminders', minutes, \`Reminder: \${what}\`);
    return \`Reminder set, in \${minutes} min: \${what}\`;
  },
}),` },
      { type: 'code', file: 'src/pipeline.ts · tick(), every second', code: `for (const event of this.deps.timers.due()) {
  this.stats.timersFired++;
  if (event.title.startsWith(REMINDER)) {          // you asked for it: straight to the thread
    this.deliver(event.subject, \`⏰ \${event.title}\`, true, 'note', 'issues');
    continue;
  }
  this.ingest(event);                              // a self-booked wakeup: same pipeline as a webhook
}` },
      { type: 'cards', cols: 3, items: [
        { h: 'crontab', html: '<code>*/10 * * * * curl -X POST localhost:4100/api/clock</code>: the oldest scheduler there is. Fine on one server; nothing runs if that server is down.' },
        { h: 'Vercel Cron Jobs', html: 'A <code>crons</code> entry in <code>vercel.json</code> calls one of your routes on a schedule. Serverless: nothing to keep running, but a job is a request, not a long-lived loop.' },
        { h: 'Cloudflare Cron Triggers', html: 'A <code>scheduled()</code> handler on a Worker, run on a cron expression. Pair it with a Durable Object alarm for “wake this one subject at 10:42”.' },
        { h: 'GitHub Actions schedule', html: '<code>on: schedule: - cron: \'0 9 * * *\'</code> runs a workflow, e.g. the 09:00 digest. Best effort: runs can start late when GitHub is busy.' },
        { h: 'Cron vs self-booked', html: 'A cron wakes the agent to scan everything; most runs find nothing. A self-booked wakeup is about one subject, with the reason, at the time the agent chose.' },
        { h: 'Here', html: 'One <code>setInterval</code> and a SQLite table: both kinds of alarm, survives restarts, and a simulated clock so the demo can jump ahead.' },
      ] },
      { type: 'cards', cols: 3, items: [
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
      { type: 'links', items: L('claudeLoop', 'grokRoutines', 'vercelCron', 'cfCron', 'ghaSchedule', 'crontabGuru') },
    ],
    points: [
      '<code>timers.ts</code>: wakeups in SQLite, due ones become events.',
      'The clock is simulated: jump instead of waiting.',
      'Evals: <b>timers</b> passes, 6 of 6.',
    ],
    actions: [['load', 'Load step-7', 7], ['link', 'Diff step-6 → step-7', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-6...step-7'], ['trigger', 'CI fails', 'ci-failed'], ['clock', '+10 min', 10], ['jump', '09:00 digest', '09:00'], ['storm'], ['reset']],
    caption: 'Green dots are wakeups the agent booked for itself, coming back in at the start.',
    say: [
      'The agent drafted a fix and asked to be woken in 10 minutes. Jump the clock.',
      'Wakeups come back as events: same prefilter, gate and inbox.',
      'Jump to 09:00: everything held arrives as one digest.',
    ],
  },

  {
    id: 'memory', part: 'Build', nav: 'Memory', step: 8,
    eyebrow: 'Step 8 · memory as files',
    title: 'A thread that knows what happened',
    lede: 'The agent worked all night and reported into the thread; now you ask it what happened. The model doesn’t carry every report in its context. Each run leaves one line in a Markdown file, the chat sees only an index of those files, and reads the one it needs. What you tell it goes into a file too, and the policy obeys that file.',
    sections: [
      { type: 'how',
        problem: "After a night of work the thread holds dozens of reports. Putting all of them into the model’s context every turn is slow, expensive and eventually too long; dropping them means the chat forgets what the agent did.",
        steps: [
          "After each decision the pipeline appends one line to <code>journal/&lt;date&gt;.md</code> and <code>subjects/&lt;subject&gt;.md</code>.",
          "The chat’s instructions list the memory files with one line each, never their contents.",
          "When a question needs it, the model calls <code>memory_read</code> on one file.",
          "The conversation keeps its last 24 messages, cut at a user message; older turns drop out, the files stay.",
          "What you say about how to treat you goes into <code>preferences.md</code>, which the policy reads.",
        ],
        code: [
          ["src/memory.ts · Memory.remember()", "journal and subject lines"],
          ["src/memory.ts · memoryTools()", "memory_read / memory_write / memory_append"],
          ["src/chat.ts · recent()", "the last 24 messages"],
          ["src/main.ts · instructions", "the index, not the contents"],
          ["src/memory.ts · DaytonaMemoryStore", "the same files in a sandbox"],
        ] },
      { type: 'embed', h: 'The one conversation, and its memory', src: '/chat?embed=1&instance=stage', full: '/chat?instance=stage', height: 560 },
      { type: 'cards', cols: 3, items: [
        { h: 'Write', html: 'After the policy decides, the pipeline appends one line to <code>journal/&lt;date&gt;.md</code> and to <code>subjects/&lt;subject&gt;.md</code>. 60 events become a page you can read.' },
        { h: 'Index, then read', html: 'The chat’s instructions hold the file list with one line each, never the contents. It calls <code>memory_read</code> for the file it needs. The conversation keeps its last 24 messages; memory keeps the rest.' },
        { h: 'Obey', html: '“Ping me at most twice a day” becomes a line in <code>preferences.md</code>. The policy re-reads it on every decision, so the ambient part changes because of something you said in chat.' },
      ] },
      { type: 'code', file: 'src/main.ts · the chat sees an index, not the events', code: `instructions: async () => \`…
Memory files (read the ones you need with memory_read; never all of them):
\${(await memory.index()).map((f) => \`- \${f.path} (\${f.lines} lines): \${f.about}\`).join('\\n')}

preferences.md is how the person wants to be treated; the policy re-reads it on every decision.\`,
tools: { ...repoTools, ...memoryTools(memory) },   // memory_read, memory_write, memory_append` },
      { type: 'cards', cols: 3, items: [
        { h: 'Meta Muse', html: 'Launched September 2026: a personal agent that remembers what you tell it and acts on it later; you can tell it to forget. WIRED reported instructions for an hourly job that keeps pages about people in your life: ambient memory, with the privacy questions that come with it.' },
        { h: 'nanoMuse', html: 'The open-source answer to Muse (Zhejiang University): memory is plain Markdown files the user can open and edit. Memory with provenance is still on its roadmap.' },
        { h: 'Claude memory tool', html: 'Anthropic’s API tool: Claude checks a <code>/memories</code> directory before a task and writes what it learns there. Your code decides where the files really live. Same idea as ours, built into the model.' },
        { h: 'Claude Code', html: '<code>CLAUDE.md</code> files are loaded at the start of every session; you edit them like code. The skills in this repo are the same move: knowledge in files, reviewed in PRs.' },
        { h: 'Letta, mem0, Zep', html: 'Memory as a service: the agent edits its own memory blocks (Letta, from MemGPT), facts extracted and searched (mem0), a temporal knowledge graph (Zep’s Graphiti). More power, and something else to run.' },
        { h: 'Where the files live', html: 'Here: <code>memory/</code> in the checkout. With <code>DAYTONA_API_KEY</code> the same files live in a Daytona sandbox, away from the code. memsearch (Zilliz, from OpenClaw) keeps them as plain text and adds search.' },
      ] },
      { type: 'table', label: 'Memory, compared', head: ['', 'Where it lives', 'Who writes it', 'How it is read back'], rows: [
        ['<b>Ours</b> (step 8)', 'Markdown files: journal, subjects, preferences, watches', 'the pipeline after every run; the chat when you say so', 'an index in the instructions, <code>memory_read</code> on demand'],
        ['<b>Claude memory tool</b>', 'a <code>/memories</code> directory your code maps to storage', 'Claude, as it works', 'Claude checks it before a task'],
        ['<b>Claude Code</b>', '<code>CLAUDE.md</code> files and auto memory', 'you; auto memory by Claude', 'loaded at the start of every session'],
        ['<b>ChatGPT memory</b>', 'saved memories and chat history, in OpenAI’s product', 'ChatGPT, or you (“remember that…”)', 'used in later chats; you can view and delete'],
        ['<b>Meta Muse</b> / nanoMuse', 'Muse: Meta’s service; nanoMuse: Markdown files', 'the agent', 'Muse: closed; nanoMuse: files you can edit'],
        ['<b>Letta</b> (MemGPT)', 'memory blocks in context, plus archival storage', 'the agent edits its own blocks', 'blocks always in context; search for the rest'],
        ['<b>mem0</b>', 'extracted facts in a vector store', 'an extraction step after conversations', 'similarity search per query'],
        ['<b>Zep</b> / Graphiti', 'a temporal knowledge graph', 'ingestion of messages and data', 'graph and semantic search, facts with time'],
        ['<b>memsearch</b>', 'Markdown files with a search index', 'the agent', 'search over the files'],
      ] },
      { type: 'links', items: L('museBuiltin', 'museWired', 'nanoMuse', 'claudeMemoryTool', 'claudeCodeMemory', 'letta', 'mem0', 'graphiti', 'memsearch', 'daytonaFs', 'chatgptMemory', 'lettaDocs', 'mem0Docs', 'zepDocs') },
    ],
    points: [
      '<code>memory.ts</code>: Markdown files, local or in a Daytona sandbox.',
      'The chat gets an index and reads on demand: no flooding.',
      '<code>preferences.md</code> is the contract between you and the policy.',
    ],
    actions: [['load', 'Load step-8', 8], ['link', 'Diff step-7 → step-8', 'https://github.com/yavorsky/ambient-agents-workshop/compare/step-7...step-8'], ['storm'], ['reset']],
    caption: 'Storm, then ask the chat what happened: watch which file it opens.',
    say: [
      'Show the step-8 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step. While Claude Code writes it, walk through Muse, nanoMuse and the memory tool below.',
      'Load step-8, Storm, then ask “What happened while I was away?”: it opens one journal file.',
      'Say “ping me at most twice a day”: preferences.md changes, the budget on the slide shows 2.',
    ],
  },

  // ---------------------------------------------------------------- wrap
  {
    id: 'memory-store', part: 'Build', nav: 'Memory: DB or files', step: null,
    eyebrow: 'Memory · where to keep it',
    title: 'In a database, or in files?',
    lede: 'Same question to both: “what happened to ci:main?”. A database answers with the rows that look most similar. Files answer with the one file about ci:main, which a person can also open, edit and review in a pull request. Both are right, for different sizes of problem.',
    sections: [
      { type: 'figure', h: 'One question, two memories', caption: 'Illustrative: the shapes of the two paths, not a benchmark. Left: a vector store answers with the nearest rows. Right: our step 8, an index in the instructions and one file read on demand.', svg: `
<svg viewBox="0 0 960 330" role="img" aria-label="Left: the agent embeds the question, queries a database and gets the five nearest rows. Right: the agent reads an index of memory files and opens the one file about ci:main.">
  <text class="t-h" x="20" y="28">In a database</text><text class="t-s" x="160" y="28">rows + vectors, queried</text>
  <text class="t-h" x="510" y="28">As files</text><text class="t-s" x="590" y="28">Markdown, read on demand</text>
  <line x1="480" y1="12" x2="480" y2="318" class="wire" stroke-dasharray="4 6"/>

  <rect class="box-a" x="20" y="56" width="140" height="64" rx="12"/><text class="t" x="34" y="82">Agent</text><text class="t-s" x="34" y="104">“what happened</text><text class="t-s" x="34" y="118">to ci:main?”</text>
  <rect class="box" x="196" y="56" width="118" height="64" rx="12"/><text class="t" x="210" y="82">Embed</text><text class="t-s" x="210" y="104">top-5</text>
  <path class="wire" d="M160 88 H196"/><path class="wire" d="M314 88 H340"/>
  <rect class="box" x="340" y="46" width="124" height="164" rx="12"/><text class="t" x="352" y="70">memories</text>
  <rect class="row-hit" x="350" y="80" width="104" height="20" rx="4"/><text class="t-s" x="356" y="94">#214 · 0.91</text>
  <rect class="row-hit" x="350" y="104" width="104" height="20" rx="4"/><text class="t-s" x="356" y="118">#87 · 0.88</text>
  <rect class="row" x="350" y="128" width="104" height="20" rx="4"/><text class="t-s" x="356" y="142">#301 · 0.71</text>
  <rect class="row" x="350" y="152" width="104" height="20" rx="4"/><text class="t-s" x="356" y="166">#12 · 0.70</text>
  <rect class="row" x="350" y="176" width="104" height="20" rx="4"/><text class="t-s" x="356" y="190">#199 · 0.69</text>
  <path class="wire" d="M402 210 V262 H160"/><text class="t-s" x="232" y="254">5 nearest rows</text>
  <rect class="box-w" x="20" y="232" width="140" height="74" rx="12"/><text class="t" x="34" y="258">Context</text><text class="t-s" x="34" y="278">5 similar snippets,</text><text class="t-s" x="34" y="294">not always the right 5</text>

  <rect class="box-a" x="510" y="56" width="140" height="64" rx="12"/><text class="t" x="524" y="82">Agent</text><text class="t-s" x="524" y="104">“what happened</text><text class="t-s" x="524" y="118">to ci:main?”</text>
  <path class="wire" d="M650 88 H690"/>
  <rect class="box" x="690" y="46" width="250" height="120" rx="12"/><text class="t" x="704" y="70">memory/ (index in the prompt)</text>
  <text class="t-s" x="704" y="92">preferences.md · 3 lines</text>
  <text class="t-s" x="704" y="110">journal/2026-10-27.md · 26</text>
  <rect class="row-hit pulse" x="700" y="118" width="230" height="20" rx="4"/><text class="t-s" x="704" y="132">subjects/ci-main.md · 3</text>
  <text class="t-s" x="704" y="154">subjects/demo-app-52.md · 4</text>
  <path class="wire" d="M815 166 V196"/><text class="t-s" x="822" y="186">memory_read</text>
  <rect class="box-ok" x="690" y="196" width="250" height="110" rx="12"/><text class="t" x="704" y="220"># subjects/ci-main</text>
  <text class="t-s" x="704" y="244">- 10:04 CI red: drafted a fix</text><text class="t-s" x="704" y="262">  → draft, pinged you</text>
  <text class="t-s" x="704" y="284">- 10:14 retry passed → act</text>
  <path class="wire" d="M690 268 H650"/>
  <rect class="box-ok" x="510" y="232" width="140" height="74" rx="12"/><text class="t" x="524" y="258">Context</text><text class="t-s" x="524" y="278">1 file, exact lines,</text><text class="t-s" x="524" y="294">with times</text>

  <g class="moving">
    <circle r="5" class="pk"><animateMotion dur="3.2s" repeatCount="indefinite" path="M160 88 H340"/></circle>
    <circle r="5" class="pk"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite" path="M402 210 V262 H160"/></circle>
    <circle r="5" class="pk-ok"><animateMotion dur="3.2s" repeatCount="indefinite" path="M650 88 H690"/></circle>
    <circle r="5" class="pk-ok"><animateMotion dur="3.2s" begin="1s" repeatCount="indefinite" path="M815 166 V196"/></circle>
    <circle r="5" class="pk-ok"><animateMotion dur="3.2s" begin="2s" repeatCount="indefinite" path="M690 268 H650"/></circle>
  </g>
</svg>` },
      { type: 'table', label: 'The trade-off', head: ['', 'Database (vectors, rows, graph)', 'Files (Markdown)'], rows: [
        ['A person can read and fix it', 'through a tool or a query', '<b>open it in an editor</b>'],
        ['Reviewed like code', 'migrations, not diffs', '<b>a diff in a pull request, history in git</b>'],
        ['Finds “something similar”', '<b>yes: embeddings, semantic search</b>', 'only by name, or with an added index (memsearch)'],
        ['Scale: many users, millions of items', '<b>yes: indexes, transactions, access control</b>', 'one folder per agent or person'],
        ['Structure and queries', '<b>joins, filters, time ranges, graphs (Zep)</b>', 'naming conventions (journal/, subjects/)'],
        ['Cost to run', 'a service, embeddings per write', '<b>a folder</b> (or a sandbox: Daytona)'],
        ['Context it adds', 'top-k snippets, decided by similarity', 'an index, then the files the model chooses'],
      ] },
      { type: 'cards', cols: 3, items: [
        { h: 'Files when', html: 'One agent, one person, or one team’s rules: preferences, watches, what happened per subject. You want to read it, correct it and review changes. Claude Code’s CLAUDE.md, Claude’s memory tool and nanoMuse are here.' },
        { h: 'A database when', html: 'Many people, millions of items, “find me the similar thing”, permissions per row, questions over time. mem0 (vectors), Zep / Graphiti (a temporal graph) and Letta’s archival memory are here.' },
        { h: 'Both, in practice', html: 'Files for what a person should see and own; a database behind a search tool for the long tail. The agent decides when to search, the same way it decides when to read a file.' },
      ] },
      { type: 'cards', cols: 3, items: [
        { h: 'mem0', html: 'Open source and hosted. Extracts facts from conversations and stores them as vectors (optionally a graph); you search them per user or agent. Python and TypeScript SDKs.' },
        { h: 'Zep / Graphiti', html: 'A temporal knowledge graph: facts are edges with the time they became true and stopped being true. Graphiti is the open-source engine; Zep is the hosted service.' },
        { h: 'Letta (formerly MemGPT)', html: 'An agent server where the agent edits its own memory blocks that stay in context, with archival memory it searches for the rest. Memory management as the agent’s own job.' },
        { h: 'LangMem', html: 'LangChain’s library for long-term memory in LangGraph agents: tools to save and search memories, and a background step that extracts them from conversations.' },
        { h: 'Supermemory', html: 'A memory API; it can also be the storage behind Claude’s memory tool, so the model’s <code>/memories</code> commands land in a hosted store.' },
        { h: 'Claude memory tool', html: 'Not a store: a tool contract. Claude asks to view, create and edit files under <code>/memories</code>; your code decides where they live. The closest to what we built.' },
      ] },
      { type: 'cards', cols: 3, label: 'Files, but where?', items: [
        { h: 'A local folder', html: 'What we start with: <code>memory/</code> next to the code. You can open, edit and git-diff it. One machine, and it lives as long as the checkout.' },
        { h: 'Daytona (our switch)', html: 'A sandbox per agent; <code>DaytonaMemoryStore</code> uses its file API (list, upload, download). It stops after 15 idle minutes and keeps the files; we start it again on the next read (~10 s measured today).' },
        { h: 'E2B', html: 'Firecracker microVM sandboxes with a files API. Pause and resume keeps the file system, so a paused sandbox can hold an agent’s memory between sessions.' },
        { h: 'Vercel Sandbox', html: 'Short-lived microVMs for running code. Files go away when it stops, so memory belongs in storage next to it, not in the sandbox itself.' },
        { h: 'Cloudflare Sandbox', html: 'Containers driven from a Worker. Pair it with R2 (a bucket) or a Durable Object for files that outlive the container.' },
        { h: 'Swapping is one class', html: '<code>MemoryStore</code> has four methods: list, read, write, removeDir. Local and Daytona both implement it; S3, R2 or a git repo would too. The agent and its tools do not change.' },
      ] },
      { type: 'links', items: L('claudeMemoryTool', 'claudeCodeMemory', 'nanoMuse', 'memsearch', 'mem0Docs', 'zepDocs', 'lettaDocs', 'chatgptMemory', 'graphitiRepo', 'langmem', 'supermemory', 'daytonaFs', 'daytonaPricing', 'e2b', 'e2bPricing', 'vercelSandbox', 'vercelSandboxPricing', 'vercelDrives', 'cfSandbox', 'cfContainersPricing') },
    ],
    points: [
      'Database: similar things, at scale, with queries.',
      'Files: the exact thing, readable, reviewable.',
      'Ours: files, because a person should own what the agent remembers.',
    ],
    actions: [],
    caption: '',
    say: [
      'Same question to both. One returns five similar rows; the other opens the one file about ci:main.',
      'Files win when a person should read and correct the memory; a database wins at scale and for “find similar”.',
      'We chose files on purpose: preferences.md is a contract you can edit.',
    ],
  },
  {
    id: 'storage', part: 'Build', nav: 'Where it keeps things', step: null,
    eyebrow: 'Storage · live, from the stage agent',
    title: 'Where the agent keeps things',
    lede: 'Three places, each for a reason. SQLite (Node’s built-in node:sqlite, one file per agent) for what must survive a restart: notifications, wakeups, session ids. Markdown files for what a person should read and own: watches, preferences, memory. The process itself for what can be rebuilt: the thread, the conversation, the event feed.',
    sections: [
      { type: 'embed', h: 'The stage agent’s storage, live (refreshes every 2 s)', src: '/db?embed=1&instance=stage', full: '/db?instance=stage', height: 860 },
      { type: 'cards', cols: 3, items: [
        { h: 'Why SQLite', html: 'One file, no server, transactions, and Node 22 ships it (<code>node:sqlite</code>). A wakeup booked before a crash still fires after it. Swap the file for Postgres when there are many agents and people.' },
        { h: 'Why files for memory', html: 'Watches and preferences are a contract with a person: they open, edit and review them. A table would hide them behind a query.' },
        { h: 'Why some state is only in memory', html: 'The thread and the event feed are views of what happened; the facts that matter are already in the journal and in SQLite. In production you would store the thread too.' },
      ] },
    ],
    points: [
      'SQLite: pings, wakeups, kv (sessions, seen ids).',
      'Files: watches, preferences, journal, subjects.',
      'Process: thread, conversation, event feed, inbox.',
    ],
    actions: [['load', 'Load step-8', 8], ['storm'], ['trigger', 'CI fails', 'ci-failed'], ['clock', '+10 min', 10], ['reset']],
    caption: 'Storm, then watch the rows arrive: pings (sent and held), the CI wakeup in wakeups, session ids in kv.',
    say: [
      'Three places on purpose: what must survive, what a person owns, what can be rebuilt.',
      'Storm and point at new rows: held notifications, a booked wakeup, the session ids per signal.',
    ],
  },
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
  {
    id: 'thanks', part: 'Wrap', nav: 'Thanks', step: null,
    eyebrow: 'Thank you',
    title: 'Thanks!',
    lede: 'Questions now, or later wherever you find me. The repo has every step as a tag: check one out and run pnpm eval.',
    sections: [
      { type: 'cards', cols: 4, items: [
        { h: 'Instagram', html: '<b style="font-size: 28px; letter-spacing: -.01em">aqson</b>' },
        { h: 'GitHub', html: '<b style="font-size: 28px; letter-spacing: -.01em">yavorsky</b>' },
        { h: 'Website', html: '<b style="font-size: 28px; letter-spacing: -.01em">yavorsky.org</b>' },
        { h: 'LinkedIn', html: '<b style="font-size: 28px; letter-spacing: -.01em">in/yvrsky</b>' },
      ] },
      { type: 'links', items: L('instagram', 'github', 'site', 'linkedin', 'workshopRepo') },
    ],
    say: ['Thank you. Repo, slides and the prompts are all in one place.', 'Happy to take questions.'],
  },
];

// Presenter-only cues for /presenter (your laptop screen, not the projector): when each chapter should
// start (minutes into the talk) and what to do outside the slide (Claude Code, the dashboard tab, music).
window.STAGE_PRESENTER = {
  title: { min: 0, cmd: [
    ["Before the talk · one terminal · starts everything clean (agents + dashboard)", "cd ~/Development/yavorsky/ambient-agents-workshop && pnpm start"],
    ["Optional · show the code: the stage worktree in VS Code (it follows L)", "code ~/Development/yavorsky/ambient-agents-workshop-wt/stage"],
    ["Optional · live coding: Claude Code inside the stage worktree (second terminal)", "cd ~/Development/yavorsky/ambient-agents-workshop && pnpm wt claude stage"],
  ], do: [
    'Before people sit down: pnpm start, then the start page (localhost:4000) shows everything green.',
    'Projector: /stage. Your laptop: /presenter, same browser. Dashboard tab: click Start sound once, then Reset all.',
    'Start the timer here when you begin talking.',
  ] },
  about: { min: 1, do: ['Keep it under a minute; the slide has the links.'] },
  signals: { min: 2, do: ['Keep it short: three questions, trigger, where the work runs, how it reaches you.'] },
  wild: { min: 3, do: ['Pick one example to tell properly (Grok Bot), skim the rest.'] },
  compare: { min: 4, do: ['Point at the last row: that is what we build today.'] },
  lessons: { min: 5, do: ['Each card links to the step that fixes it; don’t open them now.'] },
  anatomy: { min: 6, do: ['Just the map: no storm yet. “We build the agent box first.”'] },
  models: { min: 7, do: [
    "Show src/models.ts: the code asks for a model by name; one function decides where the call goes.",
    "Three tiers: decision model (Clef / Jev), small LLM for the gate, capable LLM for chat and work.",
    "If a provider has a bad day: change MODEL_CHAT in .env and restart. No code change.",
  ] },
  chat: { min: 9, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
    ["Memory is local first · the files it just wrote, in the stage worktree", "ls -R ~/Development/yavorsky/ambient-agents-workshop-wt/stage/memory && cat ~/Development/yavorsky/ambient-agents-workshop-wt/stage/memory/preferences.md"],
  ], do: [
    'Show the step-1 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step.',
    'While it works: Load step-1 on stage, then ask from the slide: “What open issues and PRs do we have?”',
    'Open one tool call to show what the model read. Then ask “Load the fix-ci skill: what would you do when CI breaks?”',
    'Optional: “Watch for PRs about cats.” It saves the watch, but nothing listens yet: that is the next step.',
    'Land it: “works great, while I am typing. What if nobody is?”',
  ] },
  tools: { min: 12, cmd: [
    ["Editor · the file to walk through", "src/tools.ts"],
  ], do: [
    "Open one tool call from the chat you just had (previous slide’s app): name + JSON in, text out. That is the whole contract.",
    "Walk src/tools.ts: read_file (description, schema, execute), then inside(): the model asks, our code decides.",
    "load_skill: skills are a tool that returns instructions. Same SKILL.md files as Claude Code.",
  ] },
  sandboxes: { min: 14, do: [
    'One minute. Tools run code; where that code runs is the security model.',
    'Point at ALLOWED_TOOLS and inside(): today’s guards. In production: a sandbox per session (Daytona, E2B, Vercel, Cloudflare).',
  ] },
  mcp: { min: 15, cmd: [
    ["Optional · Claude Code: add GitHub’s hosted MCP server (needs a GitHub token in GITHUB_PAT)", "claude mcp add-json github '{\"type\":\"http\",\"url\":\"https://api.githubcopilot.com/mcp\",\"headers\":{\"Authorization\":\"Bearer '\"$GITHUB_PAT\"'\"}}'"],
  ], do: [
    "One minute. MCP = shared tools any agent can call. Pull, not push.",
    "Line to land: “MCP gives the agent hands. Nothing in it tells the agent that CI just broke: that needs ears.”",
  ] },
  github: { min: 16, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
  ], do: [
    "Show the step-2 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step.",
    "Load step-2 on stage. Click Signed issue, CI failed, PR opened: each arrives under Events in the app as “heard it; no pipeline yet”.",
    "Click Forged signature: 401, nothing arrives. Read verifySignature aloud: five lines.",
    "Webhook vs polling in one breath: GitHub calls us (instant, needs a URL) or we ask every 10 s (works anywhere). Same AgentEvent.",
  ] },
  v0: { min: 20, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
  ], do: [
    'Show the step-3 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step.',
    'Load step-3. In the thread on the slide: “Watch for PRs about cats.” (Watches survive L.)',
    'Cat PR: one event, one run, one report in the thread. Looks fine. (No “watch:” label yet: nothing reads the watches until the gate, step 4.)',
    'Then Storm: the thread floods with reports about everything, cats or not. The watch is saved, but nothing checks it yet; point at max workers and evals 0 of 6.',
    'Dashboard → Solo naive, Storm: music goes from ambient to techno. “This is the naive ambient agent.” The right column is ours, at step 3 it is just as naive.',
  ] },
  evals: { min: 24, cmd: [
    ["Optional · any terminal in the repo · the stage agent’s code (step-3): expect 0/6", "pnpm wt eval stage"],
    ["Optional · the finished code: 6/6", "pnpm wt eval finished"],
    ["Editor · the file to walk through (the fresh agent at line 41, the six checks at line 76, timers at line 102)", "evals/run.ts"],
  ], do: [
    'On stage: press E. Six red checks: 95 noise events reached a worker, 7 runs for one CI failure, 128 pings with a budget of 3.',
    'Open evals/run.ts in the editor: the fresh agent (line 41), then the noise and duplicates checks (line 76).',
    'Show the timers check (line 102): clock.advance(11) is time travel, so a 10-minute wakeup is tested in milliseconds.',
    'Optional: pnpm wt eval finished in a terminal: 6 of 6, the same checks on the end state.',
  ] },
  gate: { min: 27, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
  ], do: [
    'Show the step-4 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step.',
    'Load step-4, Storm: dots fall at the filter; the thread gets CI, issues and the cat PR, nothing else.',
    'Read a gate reason aloud in the app’s Events list: “no watch matches” (with Clef up, it also names the closest watch and its probability).',
    'Other PR: ignored. Cat PR: reported. Same agent, you decided what matters.',
    'Compare: the chart on the slide has step-3 and step-4 side by side (runs and pings).',
  ] },
  decisions: { min: 30, do: [
    'Race 10 events (button below): Clef is done before the LLM’s first verdict. Read the cost column.',
    'Playground: “Comment that is really about CI”, kind says issues, the model says CI.',
    'Skip the storm frame if you are behind.',
  ] },
  inbox: { min: 31, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
  ], do: ['Show the step-5 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step.', 'Load step-5, CI fails three times: one run, not three, and one CI entry in the thread that updates.'] },
  policy: { min: 33, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
  ], do: ['Show the step-6 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step.', 'Load step-6, Storm. Add the budget line, Reset, Storm again: count the pings.', 'Storm (the cat watch is still there): the cat PR review asks “Merge?” in the thread with Yes / No.', 'Click Yes: the answer comes back in as an event, the worker goes ahead, and the same entry updates to “Done, as you approved”.'] },
  sessions: { min: 35, do: [
    'Walk the three lanes: CI drafts and pings, issues act quietly, the cat PR asks. Point at the 2×2.',
    'Optional: Load step-6, Storm: the worker box never shows more than three at once.',
  ] },
  payoff: { min: 36, do: [
    'Switch to the dashboard tab. Storm all: both columns get the same 60 events.',
    'Solo naive: techno, workers piling up. Then Solo stage (ours): calm, ambient. Let it play five seconds each.',
    'Back to the stage: read two rows of the table (runs 128 → 14, pings 128 → 5). The chart shows every step you stormed today.',
  ] },
  wakeups: { min: 38, do: [
    'Ask the room: what wakes your agent? If only you, it is a chat.',
    'Four alarms: push (webhooks, chat, your Yes), pull (polling), schedule (09:00), self-booked (next slide). One door in.',
  ] },
  timers: { min: 39, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
  ], do: ['Show the step-7 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step.', 'Load step-7, CI fails, then +10 min: the agent’s own wakeup comes back as an event.', 'In the app on the slide: “Remind me in 10 minutes to review the cat PR.” Open the remind tool call. Then +10 min: “⏰ Reminder” lands in the thread.', '09:00 digest. Then the cron cards: crontab, Vercel, Cloudflare, GitHub Actions; and why self-booked beats scanning.'] },
  memory: { min: 41, cmd: [
    ["Live coding only · after Claude is done, before L: run Claude’s version", "pnpm wt start stage"],
    ["Live coding only · and its evals", "pnpm wt eval stage"],
  ], do: [
    'Show the step-8 prompt (Copy below). Live coding: before L, paste it into Claude Code (stage worktree), then pnpm wt start stage runs Claude’s version; L replaces it with the tested step. It takes a few minutes: this is when you scroll the slide’s cards.',
    'While it generates: Meta Muse (hourly pages about people, privacy), nanoMuse (Markdown files), Claude memory tool (/memories), CLAUDE.md, then Letta / mem0 / Zep in one breath.',
    'Load step-8, Storm, ask: “What happened while I was away?” Open the memory_read call: one file, not 60 events.',
    'Then: “Ping me at most twice a day.” Point at preferences.md in the memory panel and the budget (2/day).',
    'No Daytona yet: memory is plain files in the stage worktree (the panel says where). Run the ls command: preferences.md, journal/, subjects/. “You can open, edit or git-diff what it remembers.”',
  ] },
  'memory-store': { min: 43, cmd: [
    ["Daytona · 1. create a key on screen (dashboard → API Keys; simulated: the real key is already in .env, never paste one live)", "https://app.daytona.io/dashboard"],
    ["Daytona · 2. switch the stage agent's memory to a sandbox (restarts it; first memory call ~11 s)", "pnpm wt memory stage daytona"],
    ["Daytona · 3. where it says memory lives now", "curl -s localhost:4103/api/memory"],
    ["Daytona · after the demo: back to local files (the storage slide reads local files)", "pnpm wt memory stage local"],
  ], do: [
    'Point at the moving packets: left, a query and five similar rows; right, the index and one file.',
    'Read two rows of the table: who can read it, and what scales. Land: “we chose files, so you own what it remembers”.',
    'Now the same files somewhere else. Daytona dashboard → API Keys → Create key, name it, show the dialog, close it without copying. Say: “it goes into .env as DAYTONA_API_KEY; mine is already there.” Revoke that key after the talk.',
    'Run pnpm wt memory stage daytona. Same code: memory.ts picks the Daytona store when the key is set. Wait for “stage → localhost:4103”.',
    'In the stage app chat: “Remember: I prefer short replies.” The first reply takes ~11 s (the sandbox starts). Show the memory_write call, then the memory panel / curl: where = daytona:<sandbox>/memory.',
    'Daytona dashboard → Sandboxes → the newest one → Filesystem → home → daytona → memory → preferences.md (refresh the tree if empty).',
    'Ask “how should you report to me?”: it reads preferences.md from the sandbox. Then pnpm wt memory stage local before the next slide.',
    'If asked “which sandbox?” (prices from their pages, 27 Oct; links are on the slide):',
    'Daytona: vCPU $0.0504/h, memory $0.0162/GiB-h, disk 5 GiB free; $200 free credit, no card. + file API, stop/start keeps files (auto-stop 15 min, archive after 7 days, as in its dashboard), fast creation. − a stopped sandbox needs ~10 s to start; one more vendor holding your memory.',
    'E2B: same unit prices ($0.000014/vCPU-s, $0.0000045/GiB-s); Hobby $0 with $100 one-time credit, Pro $150/month. + microVM isolation, pause/resume. − sessions max 1 h on Hobby, 24 h on Pro.',
    'Vercel Sandbox: Active CPU $0.128/h (only while computing; waiting on the LLM is free), memory $0.0212/GB-h; Hobby includes 5 CPU-h, 420 GB-h, 5,000 creations. + cheap for agents that mostly wait, snapshots, Drives for persistent files. − 45 min sessions on Hobby, default timeout 5 min; files need a snapshot or a Drive.',
    'Cloudflare Sandbox: billed as Cloudflare Containers on Workers Paid ($5/month) plus Workers and Durable Objects (check the Containers pricing link). + runs next to your Worker, one Durable Object per agent. − container disk is temporary: keep memory in R2 or the Durable Object.',
    'Local folder: free, instant, git-diffable. − one machine; gone with the checkout. That is why we start here.',
  ] },
  storage: { min: 44, do: [
    'Load step-8, Storm. In the embedded viewer: pings arriving (held = 1 waits for the digest), session:ci / issues / prs in kv.',
    'CI fails, then +10 min: a wakeup row appears, then fired = 1.',
  ] },
  devloop: { min: 45, do: [
    'Optional, only if Claude Code is open: /code-review on the last commit. Otherwise skip to the skill file.',
    'Open .ruler/skills/preflight/SKILL.md in the editor: it fits on one screen.',
    'Back to the review: read one finding aloud with its file:line.',
  ] },
  ship: { min: 47, cmd: [
    ["Claude Code, in the workshop repo · after chaos vs calm: record it while you take questions", "Use the launch-video skill to record a 45-second video of what we built today, from the dashboard on localhost:4000: Storm all, then Solo naive, then Solo stage, one short caption per beat, the dashboard's music as the soundtrack. Save it as video/launch.mp4 and show me a contact sheet."],
  ], do: [
    'Optional reprise only if time allows: dashboard → Storm all once more (the comparison itself was slide 20).',
    'Optional finale: run /dj in Claude Code, then DJ on the dashboard.',
    'Optional: paste the launch-video prompt below into Claude Code. It records in its own browser while you take questions; show video/launch.mp4 at the end.',
  ] },
  thanks: { min: 55, do: ['Leave this up during Q&A: handles and the repo link are on it.'] },
  blueprint: { min: 50, do: ['Repo: github.com/yavorsky/ambient-agents-workshop (make it public first).', 'Q&A from 52. If the launch video finished: open video/launch.mp4 and play it as the closer.'] },
};

// Each prompt run through Claude Code from the previous step's tag (scratch worktree), then typecheck + evals.
window.STAGE_PROMPT_CHECKS = {
  1: { on: '27 Oct', secs: 30, evals: '0/6', files: 'src/chat.ts' },
  2: { on: '27 Oct', secs: 63, evals: '0/6', files: 'src/sources/github.ts' },
  3: { on: '27 Oct', secs: 95, evals: '0/6', files: 'src/pipeline.ts' },
  4: { on: '27 Oct', secs: 96, evals: '2/6', files: 'src/prefilter.ts, src/gate.ts, src/pipeline.ts' },
  5: { on: '27 Oct', secs: 63, evals: '3/6', files: 'src/inbox.ts, src/thread.ts' },
  6: { on: '27 Oct', secs: 88, evals: '5/6', files: 'worker, policy, pipeline, server, types, runners' },
  7: { on: '27 Oct', secs: 65, evals: '6/6', files: 'src/timers.ts, src/pipeline.ts, src/main.ts' },
  8: { on: '27 Oct', secs: 114, evals: '6/6', files: 'src/memory.ts (new), chat, main, pipeline, policy, server' },
};

// Presenter-only: short facts to drop in when there is time, per chapter. Numbers are from this repo, the
// fixtures, or measured on 27 Oct (prompt runs, provider calls); prices are from the providers' pages that day.
window.STAGE_FACTS = {
  title: [
    'The whole agent at step 8 is 26 files, about 2,500 lines of TypeScript. No framework, no build step.',
    'Every step is a git tag: step-0 to step-8. Anyone can check out a step and run pnpm eval.',
  ],
  about: [
    'WRITER (writer.com): an enterprise AI platform; its own line is “turns market signals and enterprise intelligence into new ways to grow revenue”. That is ambient agents, at work.',
    'Products: WRITER Agent, Playbooks, Connectors, AI Studio, Enterprise Brain, Skills, and its own Palmyra models (Palmyra X6, “built for agentic work”).',
    '500+ enterprise deployments; customers on the site include Vanguard, Salesforce, KPMG, Dropbox, H&R Block, Boots and Clorox.',
    'Numbers WRITER publishes: KPMG 70% time saved on derivative content, Vanguard 57% faster time-to-market, Clorox “north of 85%” savings.',
    '“We never retain or train on your data.” Plus BYOK encryption, audit logs to SIEM, spend limits and alerts.',
    'Today’s repo has 71 commits; the talk was built with the same Claude Code skills it shows at the end.',
  ],
  signals: [
    'A chat agent costs you attention every turn. An ambient agent should cost attention only when it matters.',
    'Two budgets to watch all talk: model calls (money, latency) and pings (your focus).',
  ],
  wild: ['Pattern behind all of them: something wakes the agent, it works somewhere else, and reports back briefly.'],
  compare: ['Running signal work inside your chat means one long context: it grows, slows down, and every injected event stays in it.'],
  lessons: ['Each lesson is one eval check. By step 7 all six are green.'],
  anatomy: [
    'Five boxes: sources, prefilter + gate, inbox, workers, delivery. One file each in src/.',
    'Every source produces the same AgentEvent shape, so the pipeline never cares where an event came from.',
  ],
  models: [
    'Measured today: Claude Haiku 4.5 via OpenRouter answered a one-word prompt in 1.6 s; Clef (decision model) answered a typed question in 1.8 s with confidence 0.85.',
    'Swap providers with env vars: OPENROUTER_API_KEY, or the AI Gateway key. Code calls languageModel(id) only.',
  ],
  chat: [
    'Step 1 is 29 lines added to one file, src/chat.ts. Claude Code wrote it from the prompt in 30 s in rehearsal.',
    'The loop: the model answers or asks for a tool; we run the tool and send the result back; repeat up to 10 steps.',
  ],
  tools: ['A tool = name + description + zod schema + execute(). The description is the only thing the model reads to choose it.'],
  sandboxes: [
    'Measured today: a fresh Daytona sandbox took about 11 s on first use, restarting a stopped one about 10 s.',
    'Default Daytona sandbox stops after 15 idle minutes and keeps its files.',
  ],
  mcp: ['MCP is how tools are shared between apps. It gives an agent hands; it does not wake it up.'],
  github: [
    'Step 2: 127 lines in one file. Signed webhooks plus a poller that only reports what is new since the last poll.',
    'GitHub signs each delivery with HMAC-SHA256 of the raw body (X-Hub-Signature-256); we compare with timingSafeEqual.',
    'Polling every 10 s here; the first poll only records what exists, so an old issue never looks new.',
  ],
  v0: [
    'The storm is 60 events: 20 issue comments, 9 PRs, 9 issue edits, 8 new issues, 7 CI failures, 6 PR comments, 1 green build.',
    '16 of the 60 come from bots.',
  ],
  evals: [
    'No LLM in the evals: rules gate and a simulated worker. They pass with no API keys at all, in about 2 s.',
    'Against the naive agent: 95 noise events reached a worker, 7 runs for one CI failure, 128 pings with a budget of 3.',
    'Expected counts per step: 0, 0, 0, 0, 2, 3, 5, 6, 6.',
  ],
  gate: [
    '28 of 60 events never need a model: 16 from bots, 9 edits, 1 green build, 2 of the agent’s own replies. 10 more are “+1” and “thanks”.',
    'Step 4: 3 files, 161 lines. Evals go from 0/6 to 2/6 (noise, cost).',
    'The gate cascades: decision model first; under 0.6 confidence it asks the LLM; with no keys, plain rules.',
  ],
  decisions: [
    'A decision model returns a choice with probabilities, not text. You can set a threshold and log why.',
    'Clef runs on Cloudflare Workers AI. Measured today: 1.8 s for one typed question, confidence 0.85 on “CI failed on main → needs a person”.',
  ],
  inbox: [
    'Step 5: 50 lines in 2 files. Same subject + kind within 5 minutes (agent clock) merges into one piece of work.',
    'Evals 3/6: duplicates goes green.',
  ],
  policy: [
    'Step 6: 6 files, 116 lines; Claude Code did it in 88 s in rehearsal. Evals 5/6.',
    'Policy = can it be undone × how sure. Undoable and sure: act. Otherwise draft, ask, or just note it.',
  ],
  sessions: ['One session per signal (ci, issues, prs), resumed each time: context stays small and on topic.'],
  payoff: ['Same 60 events. Naive: a worker per event and a ping per result. Built: a few sessions, pings within the budget.'],
  wakeups: ['Four ways to wake: a person, a webhook, a poll, a timer. All four enter through the same Agent.ingest.'],
  timers: [
    'Step 7: 3 files, 68 lines; 65 s in rehearsal. Evals 6/6.',
    'A wakeup is a row in SQLite (the wakeups table); a 1-second heartbeat calls tick() and fires what is due.',
    'The clock is simulated, so “+10 min” and “09:00” are instant on stage.',
  ],
  memory: [
    'Step 8: 5 files, about 300 lines; 114 s in rehearsal. Still 6/6.',
    'The chat keeps a short conversation plus an index of memory files; it reads a file only when it needs it.',
    'Files: preferences.md, watches.md, journal/<date>.md, subjects/<subject>.md. Plain Markdown you can edit.',
  ],
  'memory-store': [
    'Switching to Daytona is one env var: the same MemoryStore interface, four methods.',
    'Daytona: vCPU $0.0504/h, memory $0.0162/GiB-h, $200 free credit. E2B: same unit prices, Pro $150/month. Vercel Sandbox: CPU billed only while computing.',
  ],
  storage: [
    'SQLite tables: kv (sessions, settings), pings (sent and held), wakeups (booked check-backs).',
    'Rule of thumb: SQLite for what the code needs to survive a restart, files for what a person should read.',
  ],
  devloop: [
    'This repo has 14 skills in .ruler/skills, among them code-review, preflight, pr-description, babysit, launch-video.',
    'Each step prompt was validated by running Claude Code from the previous tag: typecheck plus the expected eval count.',
  ],
  ship: ['pnpm ruler copies the same skills into Claude Code, Codex, Cursor and OpenCode: one source, every tool.'],
  thanks: ['Everything shown today is in the repo; each step is one tag and one prompt.'],
  blueprint: [
    'Start with the eval, not the agent: write the six checks for your own storm first.',
    'Repo: github.com/yavorsky/ambient-agents-workshop (tags step-0 … step-8).',
  ],
};
