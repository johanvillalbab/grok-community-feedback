import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AGENT_META,
  CANVASES,
  DEFAULT_CONVERSATION_ID,
  DEFAULT_WORKSPACE_ID,
  FEEDS,
  FILES,
} from '../data'
import {
  ACTIVITY,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROOMS,
  ROOM_FEEDS,
  permissionFor,
} from '../workspace-data'
import { loadPersistedWorkspace, savePersistedWorkspace, type PersistedWorkspace } from './persist'
import { findThread, firstThread, getWorkspace } from './workspace-nav'
import type {
  ActivityItem,
  AgentKey,
  ApprovalState,
  AutonomyLevel,
  BotCapability,
  BotPermission,
  CreatedThread,
  FeedItem,
  InstrumentationEventName,
  OpenArtifact,
  ProductGoal,
  SettingsSection,
  SideRoom,
  Workspace,
  WorkspaceModal,
  WorkspaceSurface,
} from '../types'
import { defaultCanvasWidth, defaultPreviewWidth, defaultSidebarWidth } from './preview-layout'

type InlineExtras = {
  fileId?: string
  canvasId?: string
  goalId?: string
}

function mergeWorkspace(base: Workspace, extras: CreatedThread[]): Workspace {
  if (extras.length === 0) return base
  const mine = extras.filter((item) => item.workspaceId === base.id)
  if (mine.length === 0) return base

  const attach = (groups: Workspace['agents']) => groups.map((group) => {
    const added = mine.filter((item) => item.groupId === group.id).map((item) => item.conversation)
    return added.length ? { ...group, threads: [...group.threads, ...added] } : group
  })

  return {
    ...base,
    agents: attach(base.agents),
    channels: attach(base.channels),
  }
}

function mergeRooms(workspaceId: string, created: SideRoom[], titles: Record<string, string>, archived: string[]): SideRoom[] {
  const seen = new Set<string>()
  const combined = [
    ...DEFAULT_ROOMS.filter((room) => room.workspaceId === workspaceId),
    ...created.filter((room) => room.workspaceId === workspaceId),
  ]
  return combined.reduce<SideRoom[]>((list, room) => {
    if (seen.has(room.id)) return list
    seen.add(room.id)
    list.push({
      ...room,
      title: titles[room.id] ?? room.title,
      status: archived.includes(room.id) ? 'archived' : room.status,
    })
    return list
  }, [])
}

export function useWorkspace() {
  const [workspaceId, setWorkspaceId] = useState(DEFAULT_WORKSPACE_ID)
  const [activeId, setActiveId] = useState(DEFAULT_CONVERSATION_ID)
  const [surface, setSurface] = useState<WorkspaceSurface>({ kind: 'chat' })
  const [artifact, setArtifact] = useState<OpenArtifact | null>(null)
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [modal, setModal] = useState<WorkspaceModal | null>(null)
  const [previewWidth, setPreviewWidth] = useState(defaultPreviewWidth)
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth)
  const [liveMessage, setLiveMessage] = useState('')
  const [seed] = useState(loadPersistedWorkspace)
  const [permissions, setPermissions] = useState<Record<AgentKey, BotPermission>>(() => ({
    ...DEFAULT_PERMISSIONS,
    ...seed.permissions,
  }))
  const [createdRooms, setCreatedRooms] = useState<SideRoom[]>(() => seed.createdRooms ?? [])
  const [roomTitles, setRoomTitles] = useState<Record<string, string>>(() => seed.roomTitles ?? {})
  const [archivedRoomIds, setArchivedRoomIds] = useState<string[]>(() => seed.archivedRoomIds ?? [])
  const [createdThreads, setCreatedThreads] = useState<CreatedThread[]>(() => seed.createdThreads ?? [])
  const [extraFeedItems, setExtraFeedItems] = useState<Record<string, FeedItem[]>>(() => seed.extraFeedItems ?? {})
  const [extraRoomItems, setExtraRoomItems] = useState<Record<string, FeedItem[]>>(() => seed.extraRoomItems ?? {})
  const [reactions, setReactions] = useState<Record<string, string[]>>(() => seed.reactions ?? {})
  const [approvals, setApprovals] = useState<Record<string, ApprovalState>>(() => seed.approvals ?? {})
  const [dismissedDigestIds, setDismissedDigestIds] = useState<string[]>(() => seed.dismissedDigestIds ?? [])
  const [installedListingIds, setInstalledListingIds] = useState<string[]>(() => seed.installedListingIds ?? [])
  const [instrumentedEvents, setInstrumentedEvents] = useState<ActivityItem[]>(() => seed.instrumentedEvents ?? [])
  const [createdGoals, setCreatedGoals] = useState<ProductGoal[]>(() => seed.createdGoals ?? [])
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const next: PersistedWorkspace = {
      permissions,
      createdRooms,
      roomTitles,
      archivedRoomIds,
      createdThreads,
      extraFeedItems,
      extraRoomItems,
      reactions,
      approvals,
      dismissedDigestIds,
      installedListingIds,
      instrumentedEvents,
      createdGoals,
    }
    savePersistedWorkspace(next)
  }, [
    approvals,
    archivedRoomIds,
    createdRooms,
    createdThreads,
    dismissedDigestIds,
    createdGoals,
    extraFeedItems,
    extraRoomItems,
    installedListingIds,
    instrumentedEvents,
    permissions,
    reactions,
    roomTitles,
  ])

  const workspace = useMemo(
    () => mergeWorkspace(getWorkspace(workspaceId), createdThreads),
    [createdThreads, workspaceId],
  )
  const conversation = useMemo(
    () => findThread(workspace, activeId) ?? firstThread(workspace),
    [activeId, workspace],
  )
  const rooms = useMemo(
    () => mergeRooms(workspace.id, createdRooms, roomTitles, archivedRoomIds),
    [archivedRoomIds, createdRooms, roomTitles, workspace.id],
  )
  const threadRooms = useMemo(
    () => rooms.filter((room) => room.threadId === conversation.id),
    [conversation.id, rooms],
  )
  const activeRoom = threadRooms.find((room) => room.id === activeRoomId) ?? null

  const feed = useMemo(() => {
    if (activeRoom) {
      return [...(ROOM_FEEDS[activeRoom.id] ?? []), ...(extraRoomItems[activeRoom.id] ?? [])]
    }
    return [...(FEEDS[conversation.id] ?? []), ...(extraFeedItems[conversation.id] ?? [])]
  }, [activeRoom, conversation.id, extraFeedItems, extraRoomItems])

  const file = artifact?.kind === 'file' ? FILES[artifact.id] : undefined
  const canvas = artifact?.kind === 'canvas' ? CANVASES[artifact.id] : undefined

  const announce = useCallback((message: string) => {
    setLiveMessage(message)
  }, [])

  const track = useCallback((
    event: InstrumentationEventName,
    detail: string,
    extras?: Pick<ActivityItem, 'goalId' | 'canvasId' | 'fileId' | 'threadId'>,
  ) => {
    const item: ActivityItem = {
      id: `evt-${event}-${Date.now()}`,
      workspaceId,
      agent: 'user',
      kind: 'instrument',
      event,
      title: event,
      detail,
      time: 'just now',
      ...extras,
    }
    setInstrumentedEvents((current) => [item, ...current].slice(0, 80))
    setLiveMessage(`Event ${event}`)
  }, [workspaceId])

  const rememberOpener = () => {
    const active = document.activeElement
    if (active instanceof HTMLElement) openerRef.current = active
  }

  const closeArtifact = useCallback(() => {
    const panelId = artifact?.kind === 'canvas' ? 'workspace-canvas-panel' : 'file-preview-panel'
    const panel = document.getElementById(panelId)
    const restore = Boolean(panel?.contains(document.activeElement))
    const message = artifact?.kind === 'canvas'
      ? 'Canvas closed'
      : artifact?.kind === 'file'
        ? 'Preview closed'
        : ''
    setArtifact(null)
    if (message) setLiveMessage(message)
    if (restore) {
      const opener = openerRef.current
      queueMicrotask(() => opener?.focus())
    }
  }, [artifact])

  const openFile = useCallback((id: string) => {
    rememberOpener()
    if (!artifact) setPreviewWidth(defaultPreviewWidth())
    setArtifact({ kind: 'file', id })
    const next = FILES[id]
    track('artifact_opened', `Opened file ${next?.name ?? id}.`, { fileId: id, threadId: conversation.id })
    if (next) setLiveMessage(`Preview open: ${next.name}`)
  }, [artifact, conversation.id, track])

  const openCanvas = useCallback((id: string) => {
    if (artifact?.kind === 'canvas' && artifact.id === id) {
      closeArtifact()
      return
    }
    rememberOpener()
    if (!artifact) setPreviewWidth(defaultCanvasWidth())
    setArtifact({ kind: 'canvas', id })
    const next = CANVASES[id]
    track('artifact_opened', `Opened canvas ${next?.title ?? id}.`, { canvasId: id, threadId: conversation.id })
    if (next) setLiveMessage(`Canvas open: ${next.title}`)
  }, [artifact, closeArtifact, conversation.id, track])

  const openSurface = useCallback((next: WorkspaceSurface) => {
    if (next.kind === 'digest' && surface.kind !== 'digest') {
      track('digest_viewed', `Opened the proactive digest in ${workspace.name}.`)
    }
    if (next.kind === 'activity' && surface.kind !== 'activity') {
      const who = next.agent ? ` for ${AGENT_META[next.agent].label}` : ''
      track('activity_log_opened', `Opened the activity log${who} in ${workspace.name}.`)
    }
    setSurface(next)
    setActiveRoomId(null)
    if (next.kind !== 'chat') setModal(null)
    switch (next.kind) {
      case 'chat':
        setLiveMessage(`${conversation.parentTitle}: ${conversation.title}`)
        break
      case 'goals':
        setLiveMessage(next.goalId ? `Goal open` : 'Goals')
        break
      case 'activity':
        setLiveMessage(next.agent ? `Activity: ${next.agent}` : 'Activity')
        break
      case 'digest':
        setLiveMessage('Proactive digest')
        break
      case 'artifacts':
        setLiveMessage('Artifacts')
        break
      case 'marketplace':
        setLiveMessage('Marketplace')
        break
      case 'settings':
        setLiveMessage('Workspace settings')
        break
      default: {
        const exhaustive: never = next
        return exhaustive
      }
    }
  }, [conversation.parentTitle, conversation.title, surface.kind, track, workspace.name])

  const selectThread = useCallback((id: string, roomId?: string | null) => {
    const next = findThread(workspace, id) ?? firstThread(workspace)
    if (next.id !== activeId || surface.kind !== 'chat') {
      track('context_changed', `Opened ${next.parentTitle}: ${next.title}.`, { threadId: next.id })
    }
    if (roomId) {
      const room = rooms.find((item) => item.id === roomId)
      track('side_chat_opened', `Opened “${room?.title ?? 'side room'}” on ${next.title}.`, { threadId: next.id })
    }
    setActiveId(next.id)
    setActiveRoomId(roomId ?? null)
    setSurface({ kind: 'chat' })
    setArtifact(null)
    setLiveMessage(roomId ? `${next.title}: side room` : `${next.parentTitle}: ${next.title}`)
  }, [activeId, rooms, surface.kind, track, workspace])

  const changeWorkspace = useCallback((id: string) => {
    const nextWorkspace = mergeWorkspace(getWorkspace(id), createdThreads)
    const nextThread = findThread(nextWorkspace, activeId) ?? firstThread(nextWorkspace)
    setWorkspaceId(nextWorkspace.id)
    setActiveId(nextThread.id)
    setActiveRoomId(null)
    setSurface({ kind: 'chat' })
    setArtifact(null)
    track('context_changed', `Switched workspace to ${nextWorkspace.name}. ${nextThread.parentTitle}: ${nextThread.title}.`, { threadId: nextThread.id })
    setLiveMessage(`Workspace: ${nextWorkspace.name}. ${nextThread.parentTitle}: ${nextThread.title}`)
  }, [activeId, createdThreads, track])

  const appendMessage = useCallback((target: { threadId?: string; roomId?: string }, text: string, extras?: InlineExtras) => {
    const blocks: FeedItem = {
      kind: 'message',
      id: `local-${Date.now()}`,
      blocks: [[
        { type: 'text', text },
        ...(extras?.fileId ? [{ type: 'file' as const, fileId: extras.fileId }] : []),
        ...(extras?.canvasId ? [{ type: 'canvas' as const, canvasId: extras.canvasId }] : []),
        ...(extras?.goalId ? [{ type: 'goal' as const, goalId: extras.goalId }] : []),
      ]],
    }
    if (target.roomId) {
      setExtraRoomItems((current) => ({
        ...current,
        [target.roomId!]: [...(current[target.roomId!] ?? []), blocks],
      }))
      return
    }
    if (target.threadId) {
      setExtraFeedItems((current) => ({
        ...current,
        [target.threadId!]: [...(current[target.threadId!] ?? []), blocks],
      }))
    }
  }, [])

  const createThread = useCallback((groupId: string, title: string) => {
    const group = [...workspace.agents, ...workspace.channels].find((item) => item.id === groupId)
    if (!group) return
    const id = `local-thread-${Date.now()}`
    const conversationDraft = {
      id,
      kind: group.kind,
      agent: group.agent,
      title,
      parentTitle: group.kind === 'channel' ? `#${group.name}` : group.name,
      preview: 'New thread in this sample workspace.',
      time: 'now',
      unread: false,
    }
    setCreatedThreads((current) => [...current, { workspaceId: workspace.id, groupId, conversation: conversationDraft }])
    setExtraFeedItems((current) => ({
      ...current,
      [id]: [{
        kind: 'message',
        id: `${id}-hello`,
        blocks: [[{ type: 'text', text: `Opened “${title}” as a sample thread. Nothing here is sent to a server.` }]],
      }],
    }))
    setModal(null)
    setActiveId(id)
    setActiveRoomId(null)
    setSurface({ kind: 'chat' })
    setLiveMessage(`New thread: ${title}`)
  }, [workspace])

  const createRoom = useCallback((title: string, topic: string, threadId = conversation.id) => {
    const id = `local-room-${Date.now()}`
    const room: SideRoom = {
      id,
      workspaceId: workspace.id,
      threadId,
      title,
      topic,
      status: 'open',
      owner: 'user',
    }
    setCreatedRooms((current) => [...current, room])
    setExtraRoomItems((current) => ({
      ...current,
      [id]: [{
        kind: 'message',
        id: `${id}-hello`,
        blocks: [[{ type: 'text', text: `Side room “${title}” is a scoped sample conversation. The main thread stays put.` }]],
      }],
    }))
    setActiveId(threadId)
    setActiveRoomId(id)
    setSurface({ kind: 'chat' })
    setModal(null)
    track('side_chat_opened', `Opened “${title}” on ${conversation.title}.`, { threadId })
    setLiveMessage(`Side room: ${title}`)
  }, [conversation.id, conversation.title, track, workspace.id])

  const renameRoom = useCallback((roomId: string, title: string) => {
    setRoomTitles((current) => ({ ...current, [roomId]: title }))
    setModal(null)
    setLiveMessage(`Room renamed: ${title}`)
  }, [])

  const archiveRoom = useCallback((roomId: string) => {
    setArchivedRoomIds((current) => current.includes(roomId) ? current : [...current, roomId])
    if (activeRoomId === roomId) setActiveRoomId(null)
    setLiveMessage('Room archived')
  }, [activeRoomId])

  const restoreRoom = useCallback((roomId: string) => {
    setArchivedRoomIds((current) => current.filter((id) => id !== roomId))
    setLiveMessage('Room restored')
  }, [])

  const addReaction = useCallback((messageId: string, reaction: string) => {
    setReactions((current) => {
      const next = new Set(current[messageId] ?? [])
      if (next.has(reaction)) next.delete(reaction)
      else next.add(reaction)
      return { ...current, [messageId]: [...next] }
    })
    setModal(null)
    setLiveMessage(`Reaction ${reaction}`)
  }, [])

  const setApproval = useCallback((activityId: string, state: ApprovalState) => {
    setApprovals((current) => ({ ...current, [activityId]: state }))
    setLiveMessage(state === 'approved' ? 'Approved sample action' : 'Dismissed sample action')
  }, [])

  const updateAutonomy = useCallback((agent: AgentKey, autonomy: AutonomyLevel) => {
    setPermissions((current) => ({
      ...current,
      [agent]: {
        ...permissionFor(agent, autonomy),
        requireApproval: current[agent]?.requireApproval ?? permissionFor(agent, autonomy).requireApproval,
      },
    }))
    track('autonomy_changed', `${AGENT_META[agent].label} set to ${autonomy}.`)
    setLiveMessage(`Autonomy updated`)
  }, [track])

  const toggleCapability = useCallback((agent: AgentKey, capability: BotCapability) => {
    const row = permissions[agent] ?? permissionFor(agent)
    const nextValue = !row.capabilities[capability]
    setPermissions((current) => ({
      ...current,
      [agent]: {
        ...(current[agent] ?? permissionFor(agent)),
        capabilities: {
          ...(current[agent] ?? permissionFor(agent)).capabilities,
          [capability]: nextValue,
        },
      },
    }))
    track('permission_toggled', `${AGENT_META[agent].label}: ${capabilityLabel(capability)} ${nextValue ? 'on' : 'off'}.`)
  }, [permissions, track])

  const toggleApprovalRequired = useCallback((agent: AgentKey) => {
    const row = permissions[agent] ?? permissionFor(agent)
    const nextValue = !row.requireApproval
    setPermissions((current) => ({
      ...current,
      [agent]: { ...(current[agent] ?? permissionFor(agent)), requireApproval: nextValue },
    }))
    track('permission_toggled', `${AGENT_META[agent].label}: approval required ${nextValue ? 'on' : 'off'}.`)
  }, [permissions, track])

  const dismissDigest = useCallback((id: string) => {
    setDismissedDigestIds((current) => current.includes(id) ? current : [...current, id])
    setLiveMessage('Digest card dismissed')
  }, [])

  const toggleListing = useCallback((id: string, installed: boolean) => {
    setInstalledListingIds((current) => {
      const next = new Set(current)
      const isStock = DEFAULT_PERMISSIONS && id.startsWith('list-') && ['list-community', 'list-design', 'list-pm'].includes(id)
      if (isStock) {
        if (installed) next.delete(`off:${id}`)
        else next.add(`off:${id}`)
      } else if (installed) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return [...next]
    })
    setLiveMessage(installed ? 'Sample bot installed' : 'Sample bot removed')
  }, [])

  const openSettings = useCallback((section: SettingsSection) => {
    openSurface({ kind: 'settings', section })
  }, [openSurface])

  const selectRoom = useCallback((roomId: string | null) => {
    setActiveRoomId(roomId)
    if (!roomId) return
    const room = rooms.find((item) => item.id === roomId)
    track('side_chat_opened', `Opened “${room?.title ?? 'side room'}” on ${conversation.title}.`, {
      threadId: conversation.id,
    })
  }, [conversation.id, conversation.title, rooms, track])

  const createGoal = useCallback((title: string) => {
    const id = `local-goal-${Date.now()}`
    const goal: ProductGoal = {
      id,
      workspaceId: workspace.id,
      title,
      summary: 'Sample goal created in this browser. Not a live roadmap item.',
      owner: 'user',
      collaborators: ['pm', 'community'],
      status: 'planned',
      progress: 0,
      threadId: conversation.id,
      plan: [{
        id: `${id}-step`,
        title: 'Draft the brief',
        owner: 'user',
        status: 'planned',
        note: 'Created from the Goals board so the demo can show goal_created in Activity.',
      }],
    }
    setCreatedGoals((current) => [goal, ...current])
    track('goal_created', `Created “${title}” in ${workspace.name}.`, { goalId: id, threadId: conversation.id })
    setModal(null)
    setSurface({ kind: 'goals', goalId: id })
    setLiveMessage(`Goal created: ${title}`)
  }, [conversation.id, track, workspace.id, workspace.name])

  const activity = useMemo(() => {
    const seeded = ACTIVITY.map((item) => (
      item.approval ? { ...item, approval: approvals[item.id] ?? item.approval } : item
    ))
    return [...instrumentedEvents, ...seeded]
  }, [approvals, instrumentedEvents])

  return {
    workspace,
    conversation,
    surface,
    artifact,
    file,
    canvas,
    feed,
    rooms,
    threadRooms,
    activeRoom,
    activeRoomId,
    modal,
    previewWidth,
    sidebarWidth,
    liveMessage,
    permissions,
    reactions,
    activity,
    dismissedDigestIds,
    installedListingIds,
    createdGoals,
    setPreviewWidth,
    setSidebarWidth,
    announce,
    openFile,
    openCanvas,
    closeArtifact,
    openSurface,
    selectThread,
    changeWorkspace,
    setModal,
    setActiveRoomId,
    selectRoom,
    createGoal,
    appendMessage,
    createThread,
    createRoom,
    renameRoom,
    archiveRoom,
    restoreRoom,
    addReaction,
    setApproval,
    updateAutonomy,
    toggleCapability,
    toggleApprovalRequired,
    dismissDigest,
    toggleListing,
    openSettings,
  }
}

function capabilityLabel(capability: BotCapability) {
  switch (capability) {
    case 'readFeedback':
      return 'read feedback'
    case 'propose':
      return 'propose'
    case 'attachCanvas':
      return 'attach Canvas'
    case 'notify':
      return 'notify'
    default: {
      const exhaustive: never = capability
      return exhaustive
    }
  }
}

export type WorkspaceController = ReturnType<typeof useWorkspace>
