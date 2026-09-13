import type {
  AgentKey,
  ApprovalState,
  BotPermission,
  CreatedThread,
  FeedItem,
  SideRoom,
} from '../types'

export const STORAGE_KEY = 'grok-feedback-ops-v1'

export type PersistedWorkspace = {
  permissions?: Partial<Record<AgentKey, BotPermission>>
  createdRooms?: SideRoom[]
  roomTitles?: Record<string, string>
  archivedRoomIds?: string[]
  createdThreads?: CreatedThread[]
  extraFeedItems?: Record<string, FeedItem[]>
  extraRoomItems?: Record<string, FeedItem[]>
  reactions?: Record<string, string[]>
  approvals?: Record<string, ApprovalState>
  dismissedDigestIds?: string[]
  installedListingIds?: string[]
}

export function loadPersistedWorkspace(): PersistedWorkspace {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedWorkspace
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function savePersistedWorkspace(value: PersistedWorkspace) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Prototype only: ignore quota / private-mode failures.
  }
}
