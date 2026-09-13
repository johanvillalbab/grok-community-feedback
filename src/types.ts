export type AgentKey =
  | 'is'
  | 'content'
  | 'visual'
  | 'design'
  | 'craft'
  | 'masterclass'
  | 'ceo'
  | 'pm'
  | 'community'
  | 'growth'
  | 'fullstack'
  | 'marketing'
  | 'org'
  | 'user'

export type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'file'; fileId: string; text?: string }
  | { type: 'canvas'; canvasId: string; text?: string }
  | { type: 'goal'; goalId: string; text?: string }
  | { type: 'chip'; text: string }
  | { type: 'link'; href: string; text?: string }

export type OpenArtifact =
  | { kind: 'file'; id: string }
  | { kind: 'canvas'; id: string }

export type CanvasTone = 'success' | 'warning' | 'info' | 'neutral'
export type CanvasNodeStatus = 'done' | 'active' | 'pending'

export type CanvasStat = {
  value: string
  label: string
  tone?: CanvasTone
}

export type CanvasBar = {
  label: string
  value: number
  max: number
}

export type CanvasTable = {
  caption: string
  headers: string[]
  rows: string[][]
  rowTone?: Array<CanvasTone | undefined>
}

export type CanvasCallout = {
  tone: 'info' | 'warning' | 'success'
  title: string
  body: string
}

export type CanvasFlowNode = {
  id: string
  title: string
  detail: string
  status: CanvasNodeStatus
  owner: string
  agent?: AgentKey
}

export type CanvasFlowEdge = {
  from: string
  to: string
}

export type GanttTask = {
  id: string
  laneId: string
  title: string
  detail: string
  start: number
  duration: number
  status: CanvasNodeStatus
  handoffTo?: string
  passes?: string
}

export type GanttLane = {
  id: string
  title: string
  agent: AgentKey
}

export type CanvasGantt = {
  title: string
  columns: string[]
  today: number
  lanes: GanttLane[]
  tasks: GanttTask[]
}

export type WorkspaceCanvas = {
  id: string
  title: string
  summary: string
  source: string
  stats: CanvasStat[]
  callout?: CanvasCallout
  bars?: {
    title: string
    unit: string
    items: CanvasBar[]
  }
  table?: CanvasTable
  flow?: {
    title: string
    direction: 'horizontal' | 'vertical'
    nodes: CanvasFlowNode[]
    edges: CanvasFlowEdge[]
  }
  gantt?: CanvasGantt
  quotes?: {
    title: string
    items: Array<{ quote: string; source: string }>
  }
  checklist?: {
    title: string
    items: Array<{ label: string; done: boolean; owner?: string }>
  }
}

export type SettingsSection = 'profile' | 'autonomy' | 'permissions'

export type WorkspaceSurface =
  | { kind: 'chat' }
  | { kind: 'goals'; goalId?: string }
  | { kind: 'activity'; agent?: AgentKey }
  | { kind: 'digest' }
  | { kind: 'artifacts'; artifactId?: string }
  | { kind: 'marketplace'; listingId?: string }
  | { kind: 'settings'; section: SettingsSection }

export type WorkspaceModal =
  | { kind: 'new-thread' }
  | { kind: 'share' }
  | { kind: 'desktop' }
  | { kind: 'add-file' }
  | { kind: 'voice' }
  | { kind: 'reaction'; messageId: string }
  | { kind: 'more'; messageId: string }
  | { kind: 'new-room' }
  | { kind: 'rename-room'; roomId: string }
  | { kind: 'bot-detail'; agent: AgentKey }
  | { kind: 'chip-ref'; label: string }
  | { kind: 'external-link'; href: string; title: string }

export type GoalStatus = 'planned' | 'active' | 'blocked' | 'done'

export type GoalStep = {
  id: string
  title: string
  owner: AgentKey
  status: GoalStatus
  note: string
}

export type ProductGoal = {
  id: string
  workspaceId: string
  title: string
  summary: string
  owner: AgentKey
  collaborators: AgentKey[]
  status: GoalStatus
  progress: number
  threadId?: string
  canvasId?: string
  plan: GoalStep[]
}

export type ActivityKind = 'action' | 'artifact' | 'approval' | 'background'

export type ApprovalState = 'waiting' | 'approved' | 'dismissed'

export type ActivityItem = {
  id: string
  workspaceId: string
  agent: AgentKey
  kind: ActivityKind
  title: string
  detail: string
  time: string
  goalId?: string
  canvasId?: string
  fileId?: string
  threadId?: string
  approval?: ApprovalState
}

export type SideRoomStatus = 'open' | 'archived'

export type SideRoom = {
  id: string
  workspaceId: string
  threadId: string
  title: string
  topic: string
  status: SideRoomStatus
  owner: AgentKey
  unread?: boolean
}

export type AutonomyLevel = 'observe' | 'propose' | 'assist' | 'act'

export type BotCapability = 'readFeedback' | 'propose' | 'attachCanvas' | 'notify'

export type BotPermission = {
  agent: AgentKey
  autonomy: AutonomyLevel
  capabilities: Record<BotCapability, boolean>
  requireApproval: boolean
}

export type DigestCard = {
  id: string
  workspaceId: string
  title: string
  cluster: string
  suggestion: string
  evidence: string
  tone: CanvasTone
  goalId?: string
  canvasId?: string
  threadId?: string
}

export type MarketplaceListing = {
  id: string
  name: string
  blurb: string
  color: string
  tags: string[]
  installed: boolean
  agent?: AgentKey
}

export type ArtifactRecord = {
  id: string
  workspaceId: string
  title: string
  summary: string
  source: string
  kind: 'canvas' | 'file' | 'brief'
  canvasId?: string
  fileId?: string
  goalId?: string
}

export type CreatedThread = {
  workspaceId: string
  groupId: string
  conversation: Conversation
}

export type FeedItem =
  | { kind: 'message'; id: string; blocks: InlineToken[][] }
  | {
      kind: 'thread'
      id: string
      count: number
      agents: AgentKey[]
    }
  | {
      kind: 'wrote'
      id: string
      count: number
      agents: AgentKey[]
    }
  | { kind: 'new'; id: string }

export type ThreadKind = 'agent' | 'channel'
export type WorkspaceSource = 'local' | 'cloud'

export type Conversation = {
  id: string
  kind: ThreadKind
  agent: AgentKey
  title: string
  parentTitle: string
  preview: string
  time: string
  unread: boolean
  stacked?: boolean
  stackPlus?: number
}

export type NavGroup = {
  id: string
  kind: ThreadKind
  name: string
  agent: AgentKey
  stacked?: boolean
  stackPlus?: number
  threads: Conversation[]
}

export type Workspace = {
  id: string
  name: string
  source: WorkspaceSource
  agents: NavGroup[]
  channels: NavGroup[]
}

export type WorkspaceFile = {
  id: string
  path: string
  name: string
  language: 'markdown' | 'text'
  content: string
}
