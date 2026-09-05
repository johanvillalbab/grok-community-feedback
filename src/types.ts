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
  | { type: 'chip'; text: string }
  | { type: 'link'; href: string; text?: string }

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
