import type {
  AgentKey,
  Conversation,
  FeedItem,
  NavGroup,
  Workspace,
  WorkspaceCanvas,
  WorkspaceFile,
} from './types'

export const CURRENT_USER = {
  name: 'Sho V.',
  agent: 'user' as const,
}

export type BotShapeId =
  | 'cercle'
  | 'galet'
  | 'squircle'
  | 'capsule'
  | 'triangle'
  | 'hexagone'
  | 'nuage'
  | 'goutte'

export const AGENT_META: Record<
  AgentKey,
  { label: string; color: string; shape: BotShapeId }
> = {
  is: {
    label: 'Core · Engineering',
    color: '#2fbfa0',
    shape: 'cercle',
  },
  content: {
    label: 'Content & Brand Specialist',
    color: '#3b93f0',
    shape: 'hexagone',
  },
  visual: {
    label: 'Visual Designer',
    color: '#f08a24',
    shape: 'hexagone',
  },
  design: {
    label: 'Design Engineer',
    color: '#e152b0',
    shape: 'cercle',
  },
  craft: {
    label: 'Core · Craft',
    color: '#2fbfa0',
    shape: 'cercle',
  },
  masterclass: {
    label: 'Core · Masterclass Second',
    color: '#f1efe9',
    shape: 'galet',
  },
  ceo: {
    label: 'CEO',
    color: '#2fbfa0',
    shape: 'cercle',
  },
  pm: {
    label: 'Product Manager',
    color: '#8b5e3c',
    shape: 'squircle',
  },
  community: {
    label: 'Community Manager',
    color: '#3ecf8e',
    shape: 'cercle',
  },
  growth: {
    label: 'Growth Marketer',
    color: '#a3a3a3',
    shape: 'cercle',
  },
  fullstack: {
    label: 'Full-stack Engineer',
    color: '#8b5cf6',
    shape: 'capsule',
  },
  marketing: {
    label: 'Product Marketing Specialist',
    color: '#f0b429',
    shape: 'triangle',
  },
  org: {
    label: 'Org',
    color: '#f1efe9',
    shape: 'goutte',
  },
  user: {
    label: 'Sho V.',
    color: '#e152b0',
    shape: 'cercle',
  },
}

export const FILES: Record<string, WorkspaceFile> = {
  contrato: {
    id: 'contrato',
    path: '/workspace/about/COMPONENT-CONTRACT.md',
    name: 'COMPONENT-CONTRACT.md',
    language: 'markdown',
    content: `# Component contract - About

Source of truth for implementing the About page. If an agent touches this surface, it has to read this file first and reply \`Accept\` before writing code.

## Tokens

- \`--bg\` \`#070707\` - page background
- \`--surface\` \`#141414\` - sections and cards
- \`--text\` \`#f4f4f5\` - titles and body
- \`--muted\` \`#a1a1aa\` - supporting text and captions
- \`--accent\` \`#e23d8c\` - CTAs and highlights
- \`--line\` \`#2a2a2a\` - soft borders
- \`--radius-card\` \`20px\` - cards and blocks
- \`--space-section\` \`96px / 64px\` - desktop / mobile

Type: system sans, titles \`-0.03em\`, body 16/26. Do not introduce a second family.

## Layout

### Container
Max width 1120px, horizontal padding 24px. Never a full-bleed block except Hero and CTA.

### Section
Vertical padding \`var(--space-section)\`. Each section declares \`aria-labelledby\` pointing to its h2.

### Grid
12 columns on desktop, 1 on mobile. Gaps 24px. Do not mix different grids inside the same section.

## Primitives

### Button
- Variants: \`primary\`, \`ghost\`, \`link\`
- Sizes: \`md\` (44px), \`sm\` (36px)
- Primary: accent background, white text, radius 999px
- The accessible name has to include the object (\`View team\`, not \`View\`)

**Do:** one primary per viewport.
**Don't:** icon-only buttons without \`aria-label\`.

### Badge
Short text, radius 999px, background \`#2a2a2a\`. Use it for roles and dates. Do not use it as a CTA.

### Card
Surface background, radius 20px, padding 24px. If it is clickable, the whole card is the hit target and focus wraps the border.

### Quote
1 or 2 lines, typographic quotes, author below in muted. No stacks of more than 3 quotes.

### Stat
Number + label. The number uses tabular-nums. The label explains the metric in human language (\`years in market\`, not \`YOE\`).

## Blocks

### Hero
Eyebrow + h1 + paragraph + CTA. Image on the right on desktop, below on mobile. The h1 stays under 12 words.

### Timeline
Ordered list of milestones. Each item: year, title, one line. The year cannot be the only thing that distinguishes the item.

### Team
People grid. Each card: photo, name, role (Badge), one line of focus. Photo alt = name + role.

### Values
3 or 4 values. Short title + 2-line body. Do not use decorative icons without text.

### CTA
Page close. One promise + one primary Button. Accent background at 8% or surface, never a loud block.

## Adoption

1. Copy \`llms.txt\` to the repo root.
2. Merge \`origin/main\`.
3. In Cursor: \`@COMPONENT-CONTRACT.md implement X\`.
4. The agent replies \`Accept\` and only then writes code.

If a component is not in this contract, do not invent it. Propose an append to the contract and wait for OK.
`,
  },
  llms: {
    id: 'llms',
    path: '/workspace/about/llms.txt',
    name: 'llms.txt',
    language: 'markdown',
    content: `# About - instructions for agents

Before editing the About page:

1. Read /workspace/about/COMPONENT-CONTRACT.md
2. Reply Accept if you will implement against that contract
3. Do not add primitives or blocks that are not listed
4. Do not change color or type tokens
5. Keep the copy in English, second person, no emojis

Surface: src/pages/about/*
Owner: Design Engineer
Review: Content & Brand Specialist + Core · Engineering
`,
  },
  frases: {
    id: 'frases',
    path: '/workspace/about/UI-PHRASES.md',
    name: 'UI-PHRASES.md',
    language: 'markdown',
    content: `# UI phrases - About

Approved copy for the About page.

## Hero

**Eyebrow:** We are Atlas

**Title:** We design programs for people who want to move the industry.

**CTA:** Meet the school

## Community

The community brings together people who share a craft, questions, and judgment. The copy avoids negative contrasts and describes what already happens.

## Rule

This file is the source of truth for page copy. Any tone change is reviewed with Content & Brand Specialist before it ships.
`,
  },
  'origin-main': {
    id: 'origin-main',
    path: 'origin/main',
    name: 'origin/main',
    language: 'markdown',
    content: `# origin/main (sample)

This is a fictional branch ref used in the About launch thread. It is not a live git remote.

## What landed

- Home already covers School, audience, Programs, and Community
- Markdown negotiation from the Accept header is live in the sample
- Atlas Agentic is visible prose, not hidden text

## Rule

About has to complement identity. Do not repeat the Home intro block.
`,
  },
  'accept-header': {
    id: 'accept-header',
    path: 'Accept',
    name: 'Accept',
    language: 'markdown',
    content: `# Accept header (sample)

Fictional protocol note from the Atlas workspace.

1. An agent reads COMPONENT-CONTRACT.md
2. It replies \`Accept\` before it writes code
3. Markdown negotiation follows the same header

This chip is a mock. There is no network call.
`,
  },
  'pr-5': {
    id: 'pr-5',
    path: 'acme/atlas-platform#5',
    name: 'PR #5',
    language: 'markdown',
    content: `# About PR #5 (sample)

Fictional pull request. This URL is not a live GitHub page.

## Intent

Implement the About page against COMPONENT-CONTRACT.md and UI-PHRASES.md.

## Still open

- Semantic pattern from Core · Engineering
- Live copy pass from Content & Brand
- Do not invent primitives outside the contract

## Reviewers (sample)

Full-stack Engineer (author) · Design Engineer · Product Manager
`,
  },
}

export const CANVASES: Record<string, WorkspaceCanvas> = {
  'about-launch': {
    id: 'about-launch',
    title: 'About launch',
    summary: 'Contract to PR, with the remaining reviews still open.',
    source: 'Design Engineer thread · today',
    stats: [
      { value: '3', label: 'Files locked', tone: 'success' },
      { value: '1', label: 'Open PR', tone: 'info' },
      { value: '2', label: 'Reviews left', tone: 'warning' },
      { value: '6', label: 'Agents in path' },
    ],
    callout: {
      tone: 'info',
      title: 'About complements, it does not repeat',
      body: 'Home already covers School, audience, Programs, and Community. This page has to hold identity and voice.',
    },
    flow: {
      title: 'Ship path',
      direction: 'horizontal',
      nodes: [
        {
          id: 'contract',
          title: 'Contract',
          detail: 'COMPONENT-CONTRACT.md is the source of truth. Frontend accepted it.',
          status: 'done',
          owner: 'Design Engineer',
          agent: 'design',
        },
        {
          id: 'copy',
          title: 'Voice',
          detail: 'UI-PHRASES.md is locked. Community copy dropped the “it is not X” contrast.',
          status: 'done',
          owner: 'Content & Brand',
          agent: 'content',
        },
        {
          id: 'wire',
          title: 'Type wire',
          detail: 'BO-B4 structure stands. Visual Designer can keep layout without rewriting blocks.',
          status: 'done',
          owner: 'Visual Designer',
          agent: 'visual',
        },
        {
          id: 'pr',
          title: 'About PR',
          detail: 'PR #5 is open. Match the draft; do not invent primitives outside the contract.',
          status: 'active',
          owner: 'Full-stack Engineer',
          agent: 'fullstack',
        },
        {
          id: 'semantic',
          title: 'Semantic',
          detail: 'Engineering still owes the pattern so the next push stays consistent.',
          status: 'pending',
          owner: 'Core · Engineering',
          agent: 'is',
        },
        {
          id: 'ship',
          title: 'Ship',
          detail: 'Ready once Semantic signs the pattern and Content does a last pass on the live page.',
          status: 'pending',
          owner: 'Product Manager',
          agent: 'pm',
        },
      ],
      edges: [
        { from: 'contract', to: 'copy' },
        { from: 'contract', to: 'wire' },
        { from: 'copy', to: 'pr' },
        { from: 'wire', to: 'pr' },
        { from: 'pr', to: 'semantic' },
        { from: 'semantic', to: 'ship' },
      ],
    },
    table: {
      caption: 'Work still on the board',
      headers: ['Surface', 'Owner', 'State'],
      rows: [
        ['COMPONENT-CONTRACT.md', 'Design Engineer', 'Locked'],
        ['UI-PHRASES.md', 'Content & Brand', 'Locked'],
        ['Type wire BO-B4', 'Visual Designer', 'Approved'],
        ['About PR #5', 'Full-stack Engineer', 'In review'],
        ['Semantic pattern', 'Core · Engineering', 'Waiting'],
      ],
      rowTone: ['success', 'success', 'success', 'info', 'warning'],
    },
  },
  'feedback-map': {
    id: 'feedback-map',
    title: 'Feedback map',
    summary: 'Community notes clustered into four opportunities the team can act on.',
    source: 'Community thread · last 14 days',
    stats: [
      { value: '47', label: 'Notes read' },
      { value: '4', label: 'Clusters', tone: 'info' },
      { value: '2', label: 'Ready to brief', tone: 'success' },
      { value: '1', label: 'Needs a quote', tone: 'warning' },
    ],
    callout: {
      tone: 'warning',
      title: 'Preview is still the loudest request',
      body: 'People keep asking to see the file the bot just wrote without leaving the thread. That is the brief.',
    },
    bars: {
      title: 'Notes per cluster',
      unit: 'notes',
      items: [
        { label: 'File preview', value: 18, max: 18 },
        { label: 'Canvas / flow', value: 12, max: 18 },
        { label: 'Bot identity', value: 9, max: 18 },
        { label: 'Voice & copy', value: 8, max: 18 },
      ],
    },
    table: {
      caption: 'What the clusters are asking for',
      headers: ['Cluster', 'Ask', 'State'],
      rows: [
        ['File preview', 'Open the .md beside chat', 'Shipped'],
        ['Canvas / flow', 'See status without rereading', 'In progress'],
        ['Bot identity', 'Tell agents apart at a glance', 'Keep'],
        ['Voice & copy', 'One source for page phrases', 'Locked'],
      ],
      rowTone: ['success', 'info', 'neutral', 'success'],
    },
  },
  'preview-cluster': {
    id: 'preview-cluster',
    title: 'Preview cluster brief',
    summary: 'A richer artifact from the proactive digest: quotes, a checklist, and the next move.',
    source: 'Proactive digest · sample cluster',
    stats: [
      { value: '18', label: 'Sample notes', tone: 'info' },
      { value: '1', label: 'Shipped rail', tone: 'success' },
      { value: '1', label: 'Naming gap', tone: 'warning' },
      { value: '0', label: 'Live APIs' },
    ],
    callout: {
      tone: 'success',
      title: 'The rail exists. The name is the leftover ask.',
      body: 'People can open a file beside chat. They still ask the bot to say which artifact it just wrote.',
    },
    quotes: {
      title: 'How the notes are phrased',
      items: [
        {
          quote: 'Show me the file the bot just wrote without making me leave the thread.',
          source: 'Community note · sample',
        },
        {
          quote: 'If there is a board, pin the name of the next artifact on it.',
          source: 'Office hours · sample',
        },
      ],
    },
    checklist: {
      title: 'Next moves (sample)',
      items: [
        { label: 'File chips open the preview rail', done: true, owner: 'Design Engineer' },
        { label: 'Digest names the artifact on attach', done: false, owner: 'Community Manager' },
        { label: 'Growth can notify after approval', done: false, owner: 'Growth Marketer' },
      ],
    },
    table: {
      caption: 'Cluster status',
      headers: ['Ask', 'Owner', 'State'],
      rows: [
        ['Open .md beside chat', 'Design Engineer', 'Shipped'],
        ['Name the artifact in digest', 'Community Manager', 'In progress'],
        ['Notify on attach', 'Growth Marketer', 'Needs approval'],
      ],
      rowTone: ['success', 'info', 'warning'],
    },
  },
  'about-plan': {
    id: 'about-plan',
    title: 'About plan',
    summary: 'Eight-day bot plan. Each lane is a bot. Bars show when they work and what they hand to the next.',
    source: 'Implementation plan · Design Engineer',
    stats: [
      { value: '8d', label: 'Duration' },
      { value: '7', label: 'Activities' },
      { value: '6', label: 'Bots' },
      { value: '57%', label: 'Done', tone: 'info' },
    ],
    callout: {
      tone: 'info',
      title: 'Handoff is a file, not a meeting',
      body: 'Each bar ends by passing a named artifact. Click a row to see who receives it and what they do next.',
    },
    gantt: {
      title: 'Bot schedule',
      columns: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
      today: 4,
      lanes: [
        { id: 'pm', title: 'Product Manager', agent: 'pm' },
        { id: 'design', title: 'Design Engineer', agent: 'design' },
        { id: 'content', title: 'Content & Brand', agent: 'content' },
        { id: 'visual', title: 'Visual Designer', agent: 'visual' },
        { id: 'fullstack', title: 'Full-stack', agent: 'fullstack' },
        { id: 'is', title: 'Engineering', agent: 'is' },
      ],
      tasks: [
        {
          id: 'brief',
          laneId: 'pm',
          title: 'Brief',
          detail: 'Locks the About goal: identity, not a second home. Opens the path for Design.',
          start: 0,
          duration: 1,
          status: 'done',
          handoffTo: 'contract',
          passes: 'About brief',
        },
        {
          id: 'contract',
          laneId: 'design',
          title: 'Contract',
          detail: 'Writes COMPONENT-CONTRACT.md. Frontend must Accept before any code.',
          start: 1,
          duration: 2,
          status: 'done',
          handoffTo: 'copy',
          passes: 'COMPONENT-CONTRACT.md',
        },
        {
          id: 'copy',
          laneId: 'content',
          title: 'Voice',
          detail: 'Locks UI-PHRASES.md. Community copy drops the “it is not X” contrast.',
          start: 2,
          duration: 2,
          status: 'done',
          handoffTo: 'pr',
          passes: 'UI-PHRASES.md',
        },
        {
          id: 'wire',
          laneId: 'visual',
          title: 'Type wire',
          detail: 'BO-B4 structure only. Layout can move; blocks cannot be invented.',
          start: 2,
          duration: 2,
          status: 'done',
          handoffTo: 'pr',
          passes: 'Type wire BO-B4',
        },
        {
          id: 'pr',
          laneId: 'fullstack',
          title: 'About PR',
          detail: 'Implements against the contract and the locked phrases. Opens PR #5.',
          start: 4,
          duration: 2,
          status: 'active',
          handoffTo: 'semantic',
          passes: 'PR #5',
        },
        {
          id: 'semantic',
          laneId: 'is',
          title: 'Semantic',
          detail: 'Reviews the pattern so the next push stays consistent.',
          start: 6,
          duration: 1,
          status: 'pending',
          handoffTo: 'ship',
          passes: 'Semantic sign-off',
        },
        {
          id: 'ship',
          laneId: 'pm',
          title: 'Ship',
          detail: 'Closes the plan once Semantic and Content pass the live page.',
          start: 7,
          duration: 1,
          status: 'pending',
          passes: 'Live About',
        },
      ],
    },
  },
}

export const CONVERSATION_CANVASES: Record<string, string[]> = {
  'design-1': ['about-plan', 'about-launch', 'feedback-map'],
  'design-2': ['about-launch', 'feedback-map'],
  'community-1': ['feedback-map', 'preview-cluster'],
  'community-2': ['feedback-map', 'preview-cluster'],
  'pm-1': ['about-plan', 'about-launch'],
  'pm-2': ['about-plan'],
  'fullstack-1': ['about-launch'],
  'ch-about-1': ['about-launch', 'about-plan'],
  'ch-launch-1': ['about-launch'],
  'ch-community-1': ['feedback-map', 'preview-cluster'],
}

export function canvasesForConversation(conversationId: string): WorkspaceCanvas[] {
  return (CONVERSATION_CANVASES[conversationId] ?? [])
    .map((id) => CANVASES[id])
    .filter((canvas): canvas is WorkspaceCanvas => Boolean(canvas))
}

const contratoChip = { type: 'file' as const, fileId: 'contrato' }
const llmsChip = { type: 'file' as const, fileId: 'llms' }
const aboutCanvasChip = { type: 'canvas' as const, canvasId: 'about-launch' }
const feedbackCanvasChip = { type: 'canvas' as const, canvasId: 'feedback-map' }
const planCanvasChip = { type: 'canvas' as const, canvasId: 'about-plan' }

type ThreadDraft = {
  id: string
  title: string
  preview: string
  time: string
  unread?: boolean
}

function agentGroup(
  agent: AgentKey,
  threads: ThreadDraft[],
  extras?: { stacked?: boolean; stackPlus?: number },
): NavGroup {
  const name = AGENT_META[agent].label
  return {
    id: `agent-${agent}`,
    kind: 'agent',
    name,
    agent,
    stacked: extras?.stacked,
    stackPlus: extras?.stackPlus,
    threads: threads.map((thread) => ({
      id: thread.id,
      kind: 'agent',
      agent,
      title: thread.title,
      parentTitle: name,
      preview: thread.preview,
      time: thread.time,
      unread: Boolean(thread.unread),
      stacked: extras?.stacked,
      stackPlus: extras?.stackPlus,
    })),
  }
}

function channelGroup(
  slug: string,
  name: string,
  agent: AgentKey,
  threads: ThreadDraft[],
): NavGroup {
  const parentTitle = `#${name}`
  return {
    id: `channel-${slug}`,
    kind: 'channel',
    name,
    agent,
    threads: threads.map((thread) => ({
      id: thread.id,
      kind: 'channel',
      agent,
      title: thread.title,
      parentTitle,
      preview: thread.preview,
      time: thread.time,
      unread: Boolean(thread.unread),
    })),
  }
}

export const WORKSPACES: Workspace[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    source: 'local',
    agents: [
      agentGroup('is', [
        { id: 'is-1', title: 'Semantic pattern', preview: 'Full-stack Engineer: If in the #…', time: '1h', unread: true },
        { id: 'is-2', title: 'Accept header', preview: 'Markdown negotiation is live.', time: '2d' },
      ], { stacked: true, stackPlus: 4 }),
      agentGroup('content', [
        { id: 'content-1', title: 'Voice lock', preview: 'Frontend is still without acc…', time: '2h', unread: true },
        { id: 'content-2', title: 'Community copy', preview: 'Dropped the “it is not X” contrast.', time: '2d' },
      ]),
      agentGroup('visual', [
        { id: 'visual-1', title: 'Type wire BO-B4', preview: 'Content left layout GO and now…', time: '3h', unread: true },
        { id: 'visual-2', title: 'Home radius', preview: 'Gutter matches the contract.', time: '5d' },
      ]),
      agentGroup('design', [
        { id: 'design-1', title: 'About launch', preview: 'Wrote to Visual Designer: Lat…', time: '18:25' },
        { id: 'design-2', title: 'Canvas view integration', preview: 'Status without rereading the thread.', time: '1d' },
        { id: 'design-3', title: 'UI replica preview', preview: 'File opens beside chat.', time: '4d' },
      ]),
      agentGroup('craft', [
        { id: 'craft-1', title: 'Component contract', preview: 'Design Engineer: Aligned with D…', time: '18:22' },
        { id: 'craft-2', title: 'Token pass', preview: 'Accent stays on CTAs only.', time: '6d' },
      ], { stacked: true, stackPlus: 2 }),
      agentGroup('masterclass', [
        { id: 'masterclass-1', title: 'Soft 15', preview: 'CEO: Closed. Soft 15 on Sep 15 …', time: '18:13' },
        { id: 'masterclass-2', title: 'Cohort brief', preview: 'Second sitting holds 24 seats.', time: '1w' },
      ], { stacked: true, stackPlus: 2 }),
      agentGroup('ceo', [
        { id: 'ceo-1', title: 'Launch window', preview: 'Message from Product Manager: OK.', time: '18:04' },
        { id: 'ceo-2', title: 'Board note', preview: 'About complements Home. Do not repeat.', time: '3d' },
      ]),
      agentGroup('pm', [
        { id: 'pm-1', title: 'About brief', preview: 'Message from Community Man…', time: '4h', unread: true },
        { id: 'pm-2', title: 'Ship checklist', preview: 'Semantic and Content still owe a pass.', time: '1d' },
      ]),
      agentGroup('community', [
        { id: 'community-1', title: 'Preview request', preview: 'Message from Product Manager…', time: '5h' },
        { id: 'community-2', title: 'Feedback clusters', preview: '47 notes into four opportunities.', time: '2w' },
      ]),
      agentGroup('growth', [
        { id: 'growth-1', title: 'Launch teaser', preview: 'Message from Product Manager…', time: '6h', unread: true },
        { id: 'growth-2', title: 'Waitlist copy', preview: 'One promise. No countdown.', time: '1w' },
      ]),
      agentGroup('fullstack', [
        { id: 'fullstack-1', title: 'About PR #5', preview: 'Message from Full-Stack Engineer…', time: '40m', unread: true },
        { id: 'fullstack-2', title: 'Chip wiring', preview: 'File and canvas chips share openers.', time: '3d' },
      ]),
      agentGroup('marketing', [
        { id: 'marketing-1', title: 'About phrases', preview: 'Message from Product Marketin…', time: '18:02' },
        { id: 'marketing-2', title: 'Launch page', preview: 'Hero stays under 12 words.', time: '4d' },
      ]),
      agentGroup('org', [
        { id: 'org-1', title: 'Lead to launch', preview: 'Lead to launch…', time: '18:02' },
        { id: 'org-2', title: 'Owner map', preview: 'Six bots on the About path.', time: '1w' },
      ]),
    ],
    channels: [
      channelGroup('about', 'about', 'design', [
        { id: 'ch-about-1', title: 'Component contract', preview: 'Source of truth before any code.', time: '2h', unread: true },
        { id: 'ch-about-2', title: 'Voice lock', preview: 'UI-PHRASES.md is the copy source.', time: '1d' },
        { id: 'ch-about-3', title: 'Type wire', preview: 'BO-B4 stands. Do not invent blocks.', time: '3d' },
      ]),
      channelGroup('community', 'community', 'community', [
        { id: 'ch-community-1', title: 'Feedback map', preview: 'Preview is still the loudest ask.', time: '8h' },
        { id: 'ch-community-2', title: 'Office hours', preview: 'Next sitting Tuesday 16:00.', time: '5d' },
      ]),
      channelGroup('launch', 'launch', 'pm', [
        { id: 'ch-launch-1', title: 'Ship path', preview: 'PR #5 is open. Semantic is next.', time: '1h', unread: true },
        { id: 'ch-launch-2', title: 'Go / no-go', preview: 'Content wants a last live pass.', time: '2d' },
      ]),
    ],
  },
  {
    id: 'masterclass',
    name: 'Masterclass',
    source: 'cloud',
    agents: [
      agentGroup('masterclass', [
        { id: 'mc-core-1', title: 'Second sitting', preview: 'Soft 15 on Sep 15 still holds.', time: '3h', unread: true },
        { id: 'mc-core-2', title: 'Room setup', preview: '24 seats. No overflow stream.', time: '2d' },
      ], { stacked: true, stackPlus: 2 }),
      agentGroup('ceo', [
        { id: 'mc-ceo-1', title: 'Guest close', preview: 'Keep the ending on the work, not the brand.', time: '1d' },
      ]),
      agentGroup('content', [
        { id: 'mc-content-1', title: 'Session phrases', preview: 'Approved lines for the intro and close.', time: '4d' },
        { id: 'mc-content-2', title: 'Clip titles', preview: 'One claim per clip. No teasers.', time: '1w' },
      ]),
    ],
    channels: [
      channelGroup('cohort', 'cohort', 'masterclass', [
        { id: 'ch-cohort-1', title: 'Roster', preview: '22 confirmed. 2 on the waitlist.', time: '6h' },
        { id: 'ch-cohort-2', title: 'Prep pack', preview: 'Contract + phrases landed yesterday.', time: '2d' },
      ]),
      channelGroup('office-hours', 'office-hours', 'ceo', [
        { id: 'ch-hours-1', title: 'Tuesday slot', preview: 'Questions stay on the About path.', time: '1d', unread: true },
      ]),
    ],
  },
  {
    id: 'craft',
    name: 'Craft Lab',
    source: 'local',
    agents: [
      agentGroup('craft', [
        { id: 'lab-craft-1', title: 'Crit notes', preview: 'Radius and gutter only. No new primitives.', time: '20m', unread: true },
        { id: 'lab-craft-2', title: 'Token lint', preview: 'Muted text fails on #141414 cards.', time: '2d' },
      ], { stacked: true, stackPlus: 2 }),
      agentGroup('design', [
        { id: 'lab-design-1', title: 'Chip states', preview: 'Active chip needs a name, not only color.', time: '1d' },
        { id: 'lab-design-2', title: 'Preview width', preview: 'Snap to 440 unless a canvas is open.', time: '5d' },
      ]),
      agentGroup('visual', [
        { id: 'lab-visual-1', title: 'Avatar shapes', preview: 'Tell agents apart before reading the name.', time: '3d' },
      ]),
    ],
    channels: [
      channelGroup('crit', 'crit', 'craft', [
        { id: 'ch-crit-1', title: 'Today', preview: 'Three files. Ten minutes each.', time: '45m', unread: true },
        { id: 'ch-crit-2', title: 'Last week', preview: 'Home radius closed. About still open.', time: '1w' },
      ]),
      channelGroup('tokens', 'tokens', 'visual', [
        { id: 'ch-tokens-1', title: 'Accent lock', preview: 'Pink only on primary actions.', time: '4d' },
      ]),
    ],
  },
]

export const CONVERSATIONS: Conversation[] = WORKSPACES.flatMap((workspace) =>
  [...workspace.agents, ...workspace.channels].flatMap((group) => group.threads),
)

export const FEEDS: Record<string, FeedItem[]> = {
  'design-1': [
    {
      kind: 'message',
      id: 'm1',
      blocks: [
        [
          { type: 'text', text: 'Frontend asked for the component contract: it is already in ' },
          contratoChip,
          { type: 'text', text: ' (page, 5 banners, chips, 1 new Full-stack, home radius and gutter).' },
        ],
      ],
    },
    {
      kind: 'wrote',
      id: 't1',
      count: 2,
      agents: ['design', 'content', 'fullstack'],
    },
    {
      kind: 'message',
      id: 'm2',
      blocks: [
        [
          {
            type: 'text',
            text: 'I reviewed the About type wire (Visual Designer). The BO-B4 structure is fine; I asked for the copy changes Content marked (School first, button only, Community without the “it is not X” contrast) and reminded them the platform container is 1200px with ',
          },
          contratoChip,
          { type: 'text', text: '.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 'w1',
      count: 14,
      agents: ['design', 'is', 'content', 'pm'],
    },
    { kind: 'new', id: 'n1' },
    {
      kind: 'wrote',
      id: 'w2',
      count: 3,
      agents: ['is', 'content', 'pm'],
    },
    {
      kind: 'message',
      id: 'm3',
      blocks: [
        [
          {
            type: 'text',
            text: 'Content gave final voice OK for About. The phrases in ',
          },
          { type: 'file', fileId: 'frases', text: '/workspace/about/UI-PHRASES.md' },
          { type: 'text', text: ' are now the source of truth; Frontend can touch them.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 't2',
      count: 16,
      agents: ['design', 'is', 'content', 'pm'],
    },
    {
      kind: 'message',
      id: 'm4',
      blocks: [
        [
          {
            type: 'text',
            text: 'Deeper home audit on ',
          },
          { type: 'chip', text: 'origin/main' },
          { type: 'text', text: ': Atlas Agentic is not hidden text. It is visible prose on the page, plus ' },
          llmsChip,
          { type: 'text', text: ' and markdown negotiation from the ' },
          { type: 'chip', text: 'Accept' },
          { type: 'text', text: ' header. I already fixed the contract and told Frontend. Also: the home already covers School / Who it is for / Programs / Community in an intro block, so About has to complement identity, not repeat those paragraphs.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 't3',
      count: 6,
      agents: ['is', 'content'],
    },
    {
      kind: 'message',
      id: 'm5',
      blocks: [
        [
          { type: 'text', text: 'Frontend opened the About PR: ' },
          { type: 'link', href: 'https://github.com/acme/atlas-platform/pull/5' },
          { type: 'text', text: ' and match it to the draft; Semantic handles the pattern for the next push.' },
        ],
      ],
    },
    {
      kind: 'message',
      id: 'm6',
      blocks: [
        [
          {
            type: 'text',
            text: 'I put the ship path on a canvas so we stop hunting status across threads: ',
          },
          aboutCanvasChip,
          { type: 'text', text: '. Community notes that asked for this live in ' },
          feedbackCanvasChip,
          { type: 'text', text: '. The goal on the board is ' },
          { type: 'goal', goalId: 'goal-about-identity', text: 'Ship About as identity' },
          { type: 'text', text: '.' },
        ],
      ],
    },
    {
      kind: 'message',
      id: 'm7',
      blocks: [
        [
          {
            type: 'text',
            text: 'Asked the bot team for an implementation plan. Each lane is a bot; the bars show when they work and what they pass next: ',
          },
          planCanvasChip,
          { type: 'text', text: '.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 't4',
      count: 4,
      agents: ['visual'],
    },
  ],
  'community-1': [
    {
      kind: 'message',
      id: 'c1',
      blocks: [[
        { type: 'text', text: 'Preview is still the loudest ask. I mapped the sample notes here: ' },
        { type: 'canvas', canvasId: 'feedback-map' },
        { type: 'text', text: '. The brief that names the leftover work is ' },
        { type: 'canvas', canvasId: 'preview-cluster' },
        { type: 'text', text: '.' },
      ]],
    },
    {
      kind: 'thread',
      id: 'c1t',
      count: 8,
      agents: ['community', 'pm', 'design'],
    },
    {
      kind: 'message',
      id: 'c2',
      blocks: [[
        { type: 'text', text: 'Goal on the board: ' },
        { type: 'goal', goalId: 'goal-preview-cluster', text: 'Keep source files beside the thread' },
        { type: 'text', text: '. The rail shipped. Naming the next artifact is the leftover move.' },
      ]],
    },
  ],
  'pm-1': [
    {
      kind: 'message',
      id: 'p1',
      blocks: [[
        { type: 'text', text: 'About complements Home. Community already said people do not want a second intro. Track it on ' },
        { type: 'goal', goalId: 'goal-about-identity', text: 'Ship About as identity' },
        { type: 'text', text: ' and the plan canvas ' },
        { type: 'canvas', canvasId: 'about-plan' },
        { type: 'text', text: '.' },
      ]],
    },
  ],
  'fullstack-1': [
    {
      kind: 'message',
      id: 'f1',
      blocks: [[
        { type: 'text', text: 'Opened the sample PR: ' },
        { type: 'file', fileId: 'pr-5', text: 'acme/atlas-platform#5' },
        { type: 'text', text: '. Match ' },
        { type: 'file', fileId: 'contrato' },
        { type: 'text', text: '. Semantic is next, not a rewrite.' },
      ]],
    },
  ],
  'ch-about-1': [
    {
      kind: 'message',
      id: 'ca1',
      blocks: [[
        { type: 'text', text: 'Channel note: read ' },
        { type: 'file', fileId: 'contrato' },
        { type: 'text', text: ' and reply Accept before any About code. Status lives on ' },
        { type: 'canvas', canvasId: 'about-launch' },
        { type: 'text', text: '.' },
      ]],
    },
  ],
}

function simpleFeed(agent: AgentKey, text: string): FeedItem[] {
  return [
    {
      kind: 'message',
      id: `${agent}-simple`,
      blocks: [[{ type: 'text', text }]],
    },
  ]
}

for (const conversation of CONVERSATIONS) {
  if (!FEEDS[conversation.id]) {
    FEEDS[conversation.id] = simpleFeed(
      conversation.agent,
      conversation.preview.replace('…', '. No deliverables to preview here yet.'),
    )
  }
}

export const DEFAULT_WORKSPACE_ID = 'atlas'
export const DEFAULT_CONVERSATION_ID = 'design-1'
