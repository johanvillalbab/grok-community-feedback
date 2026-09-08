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

export type Conversation = {
  id: string
  agent: AgentKey
  title: string
  preview: string
  time: string
  unread: boolean
  stacked?: boolean
  stackPlus?: number
}

export type WorkspaceFile = {
  id: string
  path: string
  name: string
  language: 'markdown' | 'text'
  content: string
}
