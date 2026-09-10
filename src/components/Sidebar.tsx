import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'
import { CURRENT_USER, WORKSPACES } from '../data'
import { BOT_FACE, isSidebarCollapsed } from '../lib/preview-layout'
import { moveFocusFromHiddenSearch, useSidebarPanel } from '../lib/use-sidebar-panel'
import {
  findGroup,
  groupHasUnread,
  matchesQuery,
  preferredThread,
  visibleThreads,
} from '../lib/workspace-nav'
import type { Conversation, NavGroup, Workspace, WorkspaceSource } from '../types'
import { Avatar } from './Avatar'
import {
  CheckIcon,
  ChevronDownIcon,
  CloudIcon,
  FolderIcon,
  GridIcon,
  HashIcon,
  PlusIcon,
  SearchIcon,
} from './Icons'

type SidebarProps = {
  workspace: Workspace
  activeId: string
  width: number
  onWidthChange: (width: number) => void
  onAnnounce?: (message: string) => void
  onSelect: (id: string) => void
  onWorkspaceChange: (id: string) => void
}

export function Sidebar({
  workspace,
  activeId,
  width,
  onWidthChange,
  onAnnounce,
  onSelect,
  onWorkspaceChange,
}: SidebarProps) {
  const { panelRef, resizerProps } = useSidebarPanel({ onWidthChange, onAnnounce })
  const listRef = useRef<HTMLElement>(null)
  const collapsed = isSidebarCollapsed(width)
  const [query, setQuery] = useState('')
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    const parent = findGroup(workspace, activeId)
    return parent ? [parent.id] : []
  })
  const [workspaceKey, setWorkspaceKey] = useState(workspace.id)
  if (workspace.id !== workspaceKey) {
    setWorkspaceKey(workspace.id)
    const parent = findGroup(workspace, activeId)
    setOpenGroups(parent ? [parent.id] : [])
  }

  useEffect(() => {
    if (!collapsed || !panelRef.current) return
    moveFocusFromHiddenSearch(panelRef.current)
  }, [collapsed, panelRef])

  const revealParent = (threadId: string) => {
    const parent = findGroup(workspace, threadId)
    if (!parent || openGroups.includes(parent.id)) return
    setOpenGroups((current) => [...current, parent.id])
  }

  const toggleGroup = (id: string, name: string, nextOpen: boolean, announce = true) => {
    setOpenGroups((current) => (nextOpen ? [...current, id] : current.filter((item) => item !== id)))
    if (announce) onAnnounce?.(nextOpen ? `${name} expanded` : `${name} collapsed`)
  }

  const selectThread = (id: string) => {
    revealParent(id)
    onSelect(id)
  }

  const searching = query.trim().length > 0
  const agents = workspace.agents.filter((group) => matchesQuery(group, query))
  const empty = agents.length === 0
  const treeOverflow = useTreeOverflow(
    listRef,
    `${workspace.id}:${query}:${collapsed}:${openGroups.join(',')}`,
  )
  const threadCount = agents.reduce(
    (sum, group) => sum + visibleThreads(group, query).length,
    0,
  )

  useEffect(() => {
    if (!searching) return
    const handle = window.setTimeout(() => {
      onAnnounce?.(empty ? `No threads match ${query.trim()}` : `${threadCount} threads`)
    }, 400)
    return () => window.clearTimeout(handle)
  }, [empty, onAnnounce, query, searching, threadCount])

  return (
    <aside
      ref={panelRef}
      className={collapsed ? 'grok-sidebar grok-sidebar--collapsed' : 'grok-sidebar'}
      style={{ width, flexBasis: width }}
      aria-label="Workspace sidebar"
    >
      <div
        className="sidebar-resizer"
        aria-label={collapsed ? 'Expand workspace sidebar' : 'Resize workspace sidebar'}
        aria-valuenow={width}
        {...resizerProps}
      />
      <div className="sidebar-top">
        <div className="windowbar">
          <span className="window-dots" aria-hidden="true">
            <span className="window-dot window-dot--red" />
            <span className="window-dot window-dot--yellow" />
            <span className="window-dot window-dot--green" />
          </span>
          <button type="button" className="sidebar-plus" aria-label="New thread">
            <PlusIcon />
          </button>
        </div>
        <WorkspaceSwitcher
          collapsed={collapsed}
          workspace={workspace}
          workspaces={WORKSPACES}
          onChange={onWorkspaceChange}
        />
        <label className="sidebar-search">
          <span className="sr-only">Search threads</span>
          <SearchIcon className="sidebar-search__icon" />
          <input
            type="search"
            placeholder="Search"
            className="sidebar-search__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div
        className={[
          'sidebar-list-wrap',
          treeOverflow.top ? 'sidebar-list-wrap--fade-top' : '',
          treeOverflow.bottom ? 'sidebar-list-wrap--fade-bottom' : '',
        ].join(' ')}
      >
        <nav
          ref={listRef}
          className="sidebar-list"
          aria-label={`${workspace.name} navigation`}
        >
          {empty ? (
            <p className="sidebar-empty">No threads match “{query.trim()}”</p>
          ) : null}
          <NavSection
            label="Agents"
            groups={agents}
            activeId={activeId}
            collapsed={collapsed}
            query={query}
            searching={searching}
            openGroups={openGroups}
            onToggle={toggleGroup}
            onSelect={selectThread}
          />
        </nav>
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-footer__item"
          aria-label="Marketplace"
        >
          <GridIcon />
          <span>Marketplace</span>
        </button>
        <button
          type="button"
          className="sidebar-profile"
          aria-label={CURRENT_USER.name}
        >
          <Avatar agent={CURRENT_USER.agent} size={18} />
          <span>{CURRENT_USER.name}</span>
        </button>
      </div>
    </aside>
  )
}

function NavSection({
  label,
  groups,
  activeId,
  collapsed,
  query,
  searching,
  openGroups,
  onToggle,
  onSelect,
}: {
  label: string
  groups: NavGroup[]
  activeId: string
  collapsed: boolean
  query: string
  searching: boolean
  openGroups: string[]
  onToggle: (id: string, name: string, nextOpen: boolean, announce?: boolean) => void
  onSelect: (id: string) => void
}) {
  const headingId = `nav-section-${label.toLowerCase()}`
  if (groups.length === 0) return null

  return (
    <section className="nav-section" aria-labelledby={headingId}>
      <h2 className="nav-section__label" id={headingId}>{label}</h2>
      <ul className="nav-section__list">
        {groups.map((group) => {
          const open = searching || openGroups.includes(group.id)
          return (
            <NavGroupItem
              key={group.id}
              group={group}
              open={open}
              activeId={activeId}
              collapsed={collapsed}
              query={query}
              searching={searching}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          )
        })}
      </ul>
    </section>
  )
}

function NavGroupItem({
  group,
  open,
  activeId,
  collapsed,
  query,
  searching,
  onToggle,
  onSelect,
}: {
  group: NavGroup
  open: boolean
  activeId: string
  collapsed: boolean
  query: string
  searching: boolean
  onToggle: (id: string, name: string, nextOpen: boolean, announce?: boolean) => void
  onSelect: (id: string) => void
}) {
  const panelId = useId()
  const shown = visibleThreads(group, query)
  const unread = groupHasUnread(group)
  const childActive = group.threads.some((thread) => thread.id === activeId)
  const liveThread = childActive
    ? group.threads.find((thread) => thread.id === activeId) ?? preferredThread(group)
    : preferredThread(group)
  const showPreview = !open && !collapsed
  const displayName = group.kind === 'channel' ? `#${group.name}` : group.name

  return (
    <li className="nav-group">
      <div className="nav-group__row">
        {collapsed ? null : (
          <button
            type="button"
            className="nav-group__chevron-btn"
            aria-expanded={open}
            aria-controls={panelId}
            disabled={searching}
            onClick={() => onToggle(group.id, displayName, !open)}
          >
            <ChevronDownIcon className={open ? 'nav-group__chevron nav-group__chevron--open' : 'nav-group__chevron'} />
            <span className="sr-only">{open ? `Collapse ${displayName}` : `Expand ${displayName}`}</span>
          </button>
        )}
        <button
          type="button"
          className={[
            'nav-group__main',
            childActive ? 'nav-group__main--current' : '',
            unread ? 'nav-group__main--unread' : '',
            showPreview ? 'nav-group__main--preview' : '',
          ].join(' ')}
          onClick={() => {
            if (!open && !collapsed) onToggle(group.id, displayName, true, false)
            onSelect(liveThread.id)
          }}
          aria-current={childActive && (collapsed || !open) ? 'page' : undefined}
          aria-label={collapsed
            ? `${displayName}, ${liveThread.title}${unread ? ', unread' : ''}`
            : undefined}
          title={collapsed ? displayName : undefined}
        >
          <span aria-hidden="true">
            <GroupGlyph group={group} size={BOT_FACE} />
          </span>
          <span className="nav-group__copy">
            <span className="nav-group__name">{displayName}</span>
            {showPreview ? (
              <span className="nav-group__preview">{liveThread.title}</span>
            ) : null}
          </span>
          {unread ? <span className="nav-group__unread" aria-hidden="true" /> : null}
          {unread ? <span className="sr-only">Unread</span> : null}
        </button>
      </div>
      {collapsed || !open ? null : (
        <ul className="nav-thread-list" id={panelId}>
          {shown.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              selected={thread.id === activeId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function ThreadRow({
  thread,
  selected,
  onSelect,
}: {
  thread: Conversation
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        className={[
          'nav-thread',
          selected ? 'nav-thread--active' : '',
          thread.unread ? 'nav-thread--unread' : '',
        ].join(' ')}
        onClick={() => onSelect(thread.id)}
        aria-current={selected ? 'page' : undefined}
      >
        <span
          className={selected ? 'nav-thread__mark nav-thread__mark--active' : 'nav-thread__mark'}
          aria-hidden="true"
        />
        <span className="nav-thread__title">{thread.title}</span>
        {thread.time ? <span className="nav-thread__time">{thread.time}</span> : null}
        {thread.unread ? <span className="sr-only">Unread</span> : null}
      </button>
    </li>
  )
}

function GroupGlyph({ group, size }: { group: NavGroup; size: number }) {
  switch (group.kind) {
    case 'agent':
      return (
        <Avatar
          agent={group.agent}
          size={size}
          stacked={group.stacked}
          plus={group.stackPlus}
        />
      )
    case 'channel':
      return <HashIcon className="nav-group__hash" />
    default: {
      const _exhaustive: never = group.kind
      return _exhaustive
    }
  }
}

function WorkspaceSwitcher({
  collapsed,
  workspace,
  workspaces,
  onChange,
}: {
  collapsed: boolean
  workspace: Workspace
  workspaces: Workspace[]
  onChange: (id: string) => void
}) {
  const menuId = useId()
  const labelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selectedIndex = useMemo(
    () => Math.max(0, workspaces.findIndex((item) => item.id === workspace.id)),
    [workspace.id, workspaces],
  )
  const [activeIndex, setActiveIndex] = useState(selectedIndex)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  const selectWorkspace = (id: string) => {
    onChange(id)
    setOpen(false)
    queueMicrotask(() => buttonRef.current?.focus())
  }

  const onButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveIndex(selectedIndex)
      setOpen(true)
    }
  }

  const onListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % workspaces.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + workspaces.length) % workspaces.length)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(workspaces.length - 1)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const next = workspaces[activeIndex]
      if (next) selectWorkspace(next.id)
      return
    }
    if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="workspace-switcher" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className="workspace-switcher__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={collapsed ? `Workspace: ${workspace.name}` : undefined}
        aria-labelledby={collapsed ? undefined : labelId}
        onClick={() => {
          if (open) {
            setOpen(false)
            return
          }
          setActiveIndex(selectedIndex)
          setOpen(true)
        }}
        onKeyDown={onButtonKeyDown}
      >
        <WorkspaceGlyph source={workspace.source} />
        <span id={labelId} className="workspace-switcher__name">{workspace.name}</span>
        <ChevronDownIcon className={open ? 'workspace-switcher__chevron workspace-switcher__chevron--open' : 'workspace-switcher__chevron'} />
      </button>
      {open ? (
        <ul
          id={menuId}
          className="workspace-menu"
          role="listbox"
          aria-label="Workspaces"
          aria-activedescendant={`${menuId}-opt-${workspaces[activeIndex]?.id ?? ''}`}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          ref={listRef}
        >
          {workspaces.map((item, index) => {
            const selected = item.id === workspace.id
            const active = index === activeIndex
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  id={`${menuId}-opt-${item.id}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={selected}
                  className={[
                    'workspace-menu__option',
                    selected ? 'workspace-menu__option--selected' : '',
                    active ? 'workspace-menu__option--active' : '',
                  ].join(' ')}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectWorkspace(item.id)}
                >
                  <WorkspaceGlyph source={item.source} />
                  <span className="workspace-menu__name">{item.name}</span>
                  <span className="workspace-menu__meta">{item.source === 'cloud' ? 'Shared' : 'Local'}</span>
                  {selected ? <CheckIcon className="workspace-menu__check" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function WorkspaceGlyph({ source }: { source: WorkspaceSource }) {
  switch (source) {
    case 'cloud':
      return <CloudIcon className="workspace-glyph" />
    case 'local':
      return <FolderIcon className="workspace-glyph" />
    default: {
      const _exhaustive: never = source
      return _exhaustive
    }
  }
}

function useTreeOverflow(ref: RefObject<HTMLElement | null>, token: string) {
  const [edge, setEdge] = useState({ top: false, bottom: false })

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const update = () => {
      const top = node.scrollTop > 2
      const bottom = node.scrollTop + node.clientHeight < node.scrollHeight - 2
      setEdge((current) => (
        current.top === top && current.bottom === bottom ? current : { top, bottom }
      ))
    }

    update()
    node.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => {
      node.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [ref, token])

  return edge
}
