import { AGENT_META, CANVASES, FILES, WORKSPACES } from './data'
import type {
  ActivityItem,
  AgentKey,
  ArtifactRecord,
  AutonomyLevel,
  BotCapability,
  BotPermission,
  DigestCard,
  FeedItem,
  MarketplaceListing,
  ProductGoal,
  SideRoom,
} from './types'

export const SAMPLE_NOTE = 'Sample workspace data. Nothing here is live product traffic.'

export const GOALS: ProductGoal[] = [
  {
    id: 'goal-about-identity',
    workspaceId: 'atlas',
    title: 'Ship About as identity, not a second Home',
    summary: 'Community notes keep asking for a page that holds voice. Home already covers School, Programs, and Community.',
    owner: 'pm',
    collaborators: ['design', 'content', 'visual', 'fullstack', 'is'],
    status: 'active',
    progress: 62,
    threadId: 'design-1',
    canvasId: 'about-plan',
    plan: [
      { id: 'g1s1', title: 'Lock the brief', owner: 'pm', status: 'done', note: 'About complements Home. Do not repeat the intro block.' },
      { id: 'g1s2', title: 'Contract and phrases', owner: 'design', status: 'done', note: 'COMPONENT-CONTRACT.md and UI-PHRASES.md are the sources of truth.' },
      { id: 'g1s3', title: 'Open PR #5', owner: 'fullstack', status: 'active', note: 'Match the draft. Do not invent primitives.' },
      { id: 'g1s4', title: 'Semantic sign-off', owner: 'is', status: 'planned', note: 'Pattern so the next push stays consistent.' },
      { id: 'g1s5', title: 'Live copy pass', owner: 'content', status: 'planned', note: 'Last pass on the shipped page, not the draft.' },
    ],
  },
  {
    id: 'goal-preview-cluster',
    workspaceId: 'atlas',
    title: 'Keep source files beside the thread',
    summary: 'The loudest community cluster: open the file a bot just wrote without leaving the conversation.',
    owner: 'community',
    collaborators: ['design', 'fullstack', 'pm'],
    status: 'done',
    progress: 100,
    threadId: 'community-1',
    canvasId: 'feedback-map',
    plan: [
      { id: 'g2s1', title: 'Cluster the notes', owner: 'community', status: 'done', note: '18 of 47 sample notes asked for an in-thread preview.' },
      { id: 'g2s2', title: 'Ship file chips', owner: 'design', status: 'done', note: 'File chips open the same rail as Canvas.' },
      { id: 'g2s3', title: 'Keep the preview resizable', owner: 'fullstack', status: 'done', note: 'Snap widths stay familiar. Escape restores focus.' },
    ],
  },
  {
    id: 'goal-canvas-status',
    workspaceId: 'atlas',
    title: 'Show project state without rereading',
    summary: 'People asked for a board they can scan. Canvas is the answer: flow, Gantt, and clustered notes.',
    owner: 'design',
    collaborators: ['pm', 'community', 'visual'],
    status: 'active',
    progress: 74,
    threadId: 'design-2',
    canvasId: 'about-launch',
    plan: [
      { id: 'g3s1', title: 'Attach Canvas to chat', owner: 'design', status: 'done', note: 'A bot can pin a Canvas on a message.' },
      { id: 'g3s2', title: 'Gantt for bot handoffs', owner: 'pm', status: 'done', note: 'Each lane is a bot. Bars name the artifact they pass.' },
      { id: 'g3s3', title: 'Digest the leftover asks', owner: 'community', status: 'active', note: 'Proactive cards still owe an owner on Voice lock.' },
    ],
  },
  {
    id: 'goal-soft-15',
    workspaceId: 'masterclass',
    title: 'Hold Soft 15 on Sep 15',
    summary: 'Second sitting stays at 24 seats. No overflow stream. Ending stays on the work.',
    owner: 'masterclass',
    collaborators: ['ceo', 'content'],
    status: 'active',
    progress: 55,
    threadId: 'mc-core-1',
    plan: [
      { id: 'g4s1', title: 'Lock the roster', owner: 'masterclass', status: 'active', note: '22 confirmed. 2 on the waitlist in the sample.' },
      { id: 'g4s2', title: 'Session phrases', owner: 'content', status: 'done', note: 'Approved lines for intro and close.' },
      { id: 'g4s3', title: 'Guest close', owner: 'ceo', status: 'planned', note: 'End on the work, not the brand.' },
    ],
  },
  {
    id: 'goal-token-lint',
    workspaceId: 'craft',
    title: 'Keep tokens honest in Craft Lab',
    summary: 'Crit notes stay on radius, gutter, and contrast. No new primitives in a lint pass.',
    owner: 'craft',
    collaborators: ['design', 'visual'],
    status: 'blocked',
    progress: 40,
    threadId: 'lab-craft-2',
    plan: [
      { id: 'g5s1', title: 'Flag muted-on-card contrast', owner: 'craft', status: 'active', note: 'Muted text fails on #141414 cards in the sample.' },
      { id: 'g5s2', title: 'Accent lock', owner: 'visual', status: 'done', note: 'Pink only on primary actions.' },
      { id: 'g5s3', title: 'Chip name, not only color', owner: 'design', status: 'blocked', note: 'Waiting on a phrase from Content.' },
    ],
  },
]

export const DEFAULT_ROOMS: SideRoom[] = [
  {
    id: 'room-semantic',
    workspaceId: 'atlas',
    threadId: 'design-1',
    title: 'Semantic review',
    topic: 'Pattern so the next About push stays consistent.',
    status: 'open',
    owner: 'is',
    unread: true,
  },
  {
    id: 'room-voice',
    workspaceId: 'atlas',
    threadId: 'design-1',
    title: 'Voice lock',
    topic: 'Phrases stay in UI-PHRASES.md. No contrast copy.',
    status: 'open',
    owner: 'content',
  },
  {
    id: 'room-preview',
    workspaceId: 'atlas',
    threadId: 'community-1',
    title: 'Preview cluster',
    topic: 'What “open the file beside chat” still owes.',
    status: 'open',
    owner: 'community',
  },
  {
    id: 'room-cohort',
    workspaceId: 'masterclass',
    threadId: 'mc-core-1',
    title: 'Roster holds',
    topic: '24 seats. Waitlist stays off-stream.',
    status: 'open',
    owner: 'masterclass',
  },
  {
    id: 'room-crit',
    workspaceId: 'craft',
    threadId: 'lab-craft-1',
    title: 'Today’s crit',
    topic: 'Three files. Ten minutes each. Radius only.',
    status: 'open',
    owner: 'craft',
  },
]

export const ROOM_FEEDS: Record<string, FeedItem[]> = {
  'room-semantic': [
    {
      kind: 'message',
      id: 'rs1',
      blocks: [[{ type: 'text', text: 'Engineering still owes the pattern. I parked the open questions here so About launch stays readable.' }]],
    },
    {
      kind: 'message',
      id: 'rs2',
      blocks: [[
        { type: 'text', text: 'The PR can ship the draft. Semantic is a follow-up, not a blocker for the first paint. Track it on ' },
        { type: 'goal', goalId: 'goal-about-identity', text: 'Ship About as identity' },
        { type: 'text', text: '.' },
      ]],
    },
  ],
  'room-voice': [
    {
      kind: 'message',
      id: 'rv1',
      blocks: [[{ type: 'text', text: 'Community copy dropped the “it is not X” contrast. Keep that rule in this room when someone proposes a rewrite.' }]],
    },
  ],
  'room-preview': [
    {
      kind: 'message',
      id: 'rp1',
      blocks: [[
        { type: 'text', text: 'Sample cluster: 18 notes asked to see the file without leaving chat. The rail is shipped. Next ask is naming the artifact in the digest.' },
      ]],
    },
  ],
  'room-cohort': [
    {
      kind: 'message',
      id: 'rc1',
      blocks: [[{ type: 'text', text: '22 confirmed, 2 waitlist. Do not add an overflow stream to “solve” the extra two.' }]],
    },
  ],
  'room-crit': [
    {
      kind: 'message',
      id: 'rk1',
      blocks: [[{ type: 'text', text: 'Today: contract, phrases, home radius. Ten minutes each. No new primitives.' }]],
    },
  ],
}

export const ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    workspaceId: 'atlas',
    agent: 'design',
    kind: 'artifact',
    title: 'Attached About plan',
    detail: 'Gantt of the bot team is on the Design Engineer thread.',
    time: '18:25',
    canvasId: 'about-plan',
    threadId: 'design-1',
    goalId: 'goal-about-identity',
  },
  {
    id: 'act-2',
    workspaceId: 'atlas',
    agent: 'fullstack',
    kind: 'action',
    title: 'Opened PR #5',
    detail: 'Sample pull request against the About draft. Waiting on Semantic.',
    time: '40m',
    fileId: 'pr-5',
    threadId: 'fullstack-1',
    goalId: 'goal-about-identity',
  },
  {
    id: 'act-3',
    workspaceId: 'atlas',
    agent: 'community',
    kind: 'background',
    title: 'Clustered 47 sample notes',
    detail: 'Four opportunities. Preview is still the loudest ask.',
    time: '2h',
    canvasId: 'feedback-map',
    threadId: 'community-2',
    goalId: 'goal-preview-cluster',
  },
  {
    id: 'act-4',
    workspaceId: 'atlas',
    agent: 'is',
    kind: 'approval',
    title: 'Wants to attach Semantic pattern',
    detail: 'Autonomy is Assist. Approval is on before a Canvas lands on #launch.',
    time: '25m',
    threadId: 'is-1',
    canvasId: 'about-launch',
    approval: 'waiting',
  },
  {
    id: 'act-5',
    workspaceId: 'atlas',
    agent: 'content',
    kind: 'approval',
    title: 'Propose live-page copy pass',
    detail: 'Would notify Growth once phrases are locked on the shipped page.',
    time: '1h',
    goalId: 'goal-about-identity',
    approval: 'waiting',
  },
  {
    id: 'act-6',
    workspaceId: 'atlas',
    agent: 'pm',
    kind: 'background',
    title: 'Watching launch window',
    detail: 'Ship checklist still lists Semantic and Content.',
    time: '4h',
    threadId: 'pm-2',
    goalId: 'goal-about-identity',
  },
  {
    id: 'act-7',
    workspaceId: 'masterclass',
    agent: 'masterclass',
    kind: 'action',
    title: 'Held Soft 15',
    detail: 'Sample calendar: Sep 15, 24 seats, no overflow.',
    time: '3h',
    threadId: 'mc-core-1',
    goalId: 'goal-soft-15',
  },
  {
    id: 'act-8',
    workspaceId: 'craft',
    agent: 'craft',
    kind: 'approval',
    title: 'Ask Design to name chip states',
    detail: 'Active chip needs a name, not only color. Waiting for a go-ahead.',
    time: '20m',
    threadId: 'lab-design-1',
    approval: 'waiting',
    goalId: 'goal-token-lint',
  },
  {
    id: 'act-9',
    workspaceId: 'atlas',
    agent: 'visual',
    kind: 'artifact',
    title: 'Posted type wire BO-B4',
    detail: 'Structure stands. Layout can move; blocks cannot be invented.',
    time: '3h',
    threadId: 'visual-1',
    fileId: 'contrato',
  },
]

const CAPABILITY_BY_LEVEL: Record<AutonomyLevel, Record<BotCapability, boolean>> = {
  observe: { readFeedback: true, propose: false, attachCanvas: false, notify: false },
  propose: { readFeedback: true, propose: true, attachCanvas: false, notify: false },
  assist: { readFeedback: true, propose: true, attachCanvas: true, notify: true },
  act: { readFeedback: true, propose: true, attachCanvas: true, notify: true },
}

const DEFAULT_AUTONOMY: Partial<Record<AgentKey, AutonomyLevel>> = {
  community: 'observe',
  content: 'propose',
  visual: 'propose',
  marketing: 'propose',
  growth: 'propose',
  design: 'assist',
  pm: 'assist',
  ceo: 'assist',
  org: 'observe',
  is: 'act',
  fullstack: 'act',
  craft: 'assist',
  masterclass: 'assist',
  user: 'act',
}

export function permissionFor(agent: AgentKey, autonomy?: AutonomyLevel): BotPermission {
  const level = autonomy ?? DEFAULT_AUTONOMY[agent] ?? 'propose'
  return {
    agent,
    autonomy: level,
    capabilities: { ...CAPABILITY_BY_LEVEL[level] },
    requireApproval: level === 'propose' || level === 'assist' || agent === 'is',
  }
}

export const DEFAULT_PERMISSIONS: Record<AgentKey, BotPermission> = Object.fromEntries(
  (Object.keys(AGENT_META) as AgentKey[]).map((agent) => [agent, permissionFor(agent)]),
) as Record<AgentKey, BotPermission>

export const DIGEST_CARDS: DigestCard[] = [
  {
    id: 'digest-preview',
    workspaceId: 'atlas',
    title: 'Preview is still the loudest cluster',
    cluster: 'File preview',
    suggestion: 'Name the next artifact in the digest when a bot writes a file, so people do not hunt the chip.',
    evidence: 'Sample: 18 of 47 notes. Preview rail already shipped.',
    tone: 'success',
    goalId: 'goal-preview-cluster',
    canvasId: 'feedback-map',
    threadId: 'community-1',
  },
  {
    id: 'digest-canvas',
    workspaceId: 'atlas',
    title: 'Status without rereading still has a gap',
    cluster: 'Canvas / flow',
    suggestion: 'Pin About launch on #launch so Semantic does not live only in Design Engineer.',
    evidence: 'Sample: 12 notes asked for a board. Gantt exists; the channel is quiet.',
    tone: 'info',
    goalId: 'goal-canvas-status',
    canvasId: 'about-launch',
    threadId: 'ch-launch-1',
  },
  {
    id: 'digest-voice',
    workspaceId: 'atlas',
    title: 'Voice lock needs a quote steward',
    cluster: 'Voice & copy',
    suggestion: 'Give Content a side room for phrase disputes so About launch stays on the ship path.',
    evidence: 'Sample: 8 notes. UI-PHRASES.md is locked; live-page pass is not.',
    tone: 'warning',
    goalId: 'goal-about-identity',
    threadId: 'content-1',
  },
  {
    id: 'digest-identity',
    workspaceId: 'atlas',
    title: 'Bot faces are working. Keep them.',
    cluster: 'Bot identity',
    suggestion: 'No brief. Treat this as a keep. New marketplace bots should reuse the face language.',
    evidence: 'Sample: 9 notes. People can tell agents apart before reading the name.',
    tone: 'neutral',
    canvasId: 'preview-cluster',
  },
  {
    id: 'digest-soft15',
    workspaceId: 'masterclass',
    title: 'Waitlist pressure on Soft 15',
    cluster: 'Cohort',
    suggestion: 'Keep the sitting at 24. Answer the extra two with office hours, not a stream.',
    evidence: 'Sample roster: 22 confirmed, 2 waitlist.',
    tone: 'info',
    goalId: 'goal-soft-15',
    threadId: 'ch-hours-1',
  },
  {
    id: 'digest-tokens',
    workspaceId: 'craft',
    title: 'Muted text fails on dark cards',
    cluster: 'Tokens',
    suggestion: 'Log a lint note, then stop. Do not invent a new muted token in crit.',
    evidence: 'Sample contrast check on #141414 cards.',
    tone: 'warning',
    goalId: 'goal-token-lint',
    threadId: 'lab-craft-2',
  },
]

export const MARKETPLACE: MarketplaceListing[] = [
  {
    id: 'list-community',
    name: 'Community Manager',
    blurb: 'Reads sample feedback clusters and drafts the next digest card.',
    color: '#3ecf8e',
    tags: ['feedback', 'installed'],
    installed: true,
    agent: 'community',
  },
  {
    id: 'list-design',
    name: 'Design Engineer',
    blurb: 'Attaches Canvas and contracts beside the thread.',
    color: '#e152b0',
    tags: ['canvas', 'installed'],
    installed: true,
    agent: 'design',
  },
  {
    id: 'list-pm',
    name: 'Product Manager',
    blurb: 'Owns goals, ship windows, and who is waiting.',
    color: '#8b5e3c',
    tags: ['goals', 'installed'],
    installed: true,
    agent: 'pm',
  },
  {
    id: 'list-quote',
    name: 'Quote Steward',
    blurb: 'Keeps community quotes attached to a cluster without rewriting them.',
    color: '#7eb4f5',
    tags: ['available', 'copy'],
    installed: false,
  },
  {
    id: 'list-hours',
    name: 'Office Hours Host',
    blurb: 'Drafts sitting notes and keeps overflow off the main thread.',
    color: '#f0b429',
    tags: ['available', 'community'],
    installed: false,
  },
  {
    id: 'list-lint',
    name: 'Token Lint',
    blurb: 'Flags contrast and accent drift before a crit starts inventing primitives.',
    color: '#2fbfa0',
    tags: ['available', 'craft'],
    installed: false,
  },
]

export const ARTIFACTS: ArtifactRecord[] = [
  {
    id: 'art-about-plan',
    workspaceId: 'atlas',
    title: 'About plan',
    summary: 'Eight-day bot Gantt. Each lane hands a named artifact.',
    source: 'Design Engineer · sample',
    kind: 'canvas',
    canvasId: 'about-plan',
    goalId: 'goal-about-identity',
  },
  {
    id: 'art-about-launch',
    workspaceId: 'atlas',
    title: 'About launch',
    summary: 'Contract to PR, with reviews still open.',
    source: 'Design Engineer · sample',
    kind: 'canvas',
    canvasId: 'about-launch',
    goalId: 'goal-canvas-status',
  },
  {
    id: 'art-feedback-map',
    workspaceId: 'atlas',
    title: 'Feedback map',
    summary: '47 sample notes in four clusters.',
    source: 'Community · last 14 days (sample)',
    kind: 'canvas',
    canvasId: 'feedback-map',
    goalId: 'goal-preview-cluster',
  },
  {
    id: 'art-preview-cluster',
    workspaceId: 'atlas',
    title: 'Preview cluster brief',
    summary: 'Quotes and a next-move checklist from the loudest ask.',
    source: 'Proactive digest · sample',
    kind: 'brief',
    canvasId: 'preview-cluster',
    goalId: 'goal-preview-cluster',
  },
  {
    id: 'art-contract',
    workspaceId: 'atlas',
    title: 'COMPONENT-CONTRACT.md',
    summary: 'Source of truth before any About code.',
    source: '/workspace/about',
    kind: 'file',
    fileId: 'contrato',
    goalId: 'goal-about-identity',
  },
  {
    id: 'art-phrases',
    workspaceId: 'atlas',
    title: 'UI-PHRASES.md',
    summary: 'Locked page copy. Content reviews tone changes.',
    source: '/workspace/about',
    kind: 'file',
    fileId: 'frases',
    goalId: 'goal-about-identity',
  },
  {
    id: 'art-pr',
    workspaceId: 'atlas',
    title: 'PR #5 (sample)',
    summary: 'Fictional About pull request. Match the draft.',
    source: 'acme/atlas-platform',
    kind: 'file',
    fileId: 'pr-5',
    goalId: 'goal-about-identity',
  },
]

export const CHIP_FILES: Record<string, string> = {
  'origin/main': 'origin-main',
  Accept: 'accept-header',
}

export const EXTERNAL_PREVIEWS: Record<string, { fileId: string; title: string }> = {
  'https://github.com/acme/atlas-platform/pull/5': {
    fileId: 'pr-5',
    title: 'PR #5 (sample)',
  },
}

export const REACTIONS = ['👍', '✅', '👀', '🎯', '📌'] as const

export const WORKSPACE_BOTS: AgentKey[] = WORKSPACES
  .flatMap((workspace) => workspace.agents.map((group) => group.agent))
  .filter((agent, index, list) => list.indexOf(agent) === index)

export function goalsForWorkspace(workspaceId: string): ProductGoal[] {
  return GOALS.filter((goal) => goal.workspaceId === workspaceId)
}

export function goalById(id: string): ProductGoal | undefined {
  return GOALS.find((goal) => goal.id === id)
}

export function artifactsForWorkspace(workspaceId: string): ArtifactRecord[] {
  return ARTIFACTS.filter((item) => item.workspaceId === workspaceId)
}

export function digestForWorkspace(workspaceId: string): DigestCard[] {
  return DIGEST_CARDS.filter((item) => item.workspaceId === workspaceId)
}

export function activityForWorkspace(workspaceId: string): ActivityItem[] {
  return ACTIVITY.filter((item) => item.workspaceId === workspaceId)
}

export function listingById(id: string): MarketplaceListing | undefined {
  return MARKETPLACE.find((item) => item.id === id)
}

export function canvasExists(id: string): boolean {
  return Boolean(CANVASES[id])
}

export function fileExists(id: string): boolean {
  return Boolean(FILES[id])
}
