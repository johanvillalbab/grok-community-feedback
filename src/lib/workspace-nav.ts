import { WORKSPACES } from '../data'
import type { Conversation, NavGroup, Workspace } from '../types'

export function getWorkspace(id: string): Workspace {
  return WORKSPACES.find((item) => item.id === id) ?? WORKSPACES[0]
}

export function groupsOf(workspace: Workspace): NavGroup[] {
  return [...workspace.agents, ...workspace.channels]
}

export function findThread(workspace: Workspace, threadId: string): Conversation | undefined {
  for (const group of groupsOf(workspace)) {
    const thread = group.threads.find((item) => item.id === threadId)
    if (thread) return thread
  }
}

export function findGroup(workspace: Workspace, threadId: string): NavGroup | undefined {
  return groupsOf(workspace).find((group) => group.threads.some((item) => item.id === threadId))
}

export function firstThread(workspace: Workspace): Conversation {
  const thread = groupsOf(workspace).flatMap((group) => group.threads)[0]
  if (!thread) {
    throw new Error(`Workspace ${workspace.id} has no threads`)
  }
  return thread
}

export function preferredThread(group: NavGroup): Conversation {
  return group.threads.find((thread) => thread.unread) ?? group.threads[0]
}

export function groupHasUnread(group: NavGroup): boolean {
  return group.threads.some((thread) => thread.unread)
}

export function matchesQuery(group: NavGroup, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const parentHit = group.name.toLowerCase().includes(needle)
  const threadHit = group.threads.some((thread) => {
    return thread.title.toLowerCase().includes(needle) || thread.preview.toLowerCase().includes(needle)
  })
  return parentHit || threadHit
}

export function visibleThreads(group: NavGroup, query: string): Conversation[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return group.threads
  if (group.name.toLowerCase().includes(needle)) return group.threads
  return group.threads.filter((thread) => {
    return thread.title.toLowerCase().includes(needle) || thread.preview.toLowerCase().includes(needle)
  })
}
