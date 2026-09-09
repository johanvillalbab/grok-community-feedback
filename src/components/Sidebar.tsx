import { useEffect } from 'react'
import { CURRENT_USER } from '../data'
import { isSidebarCollapsed } from '../lib/preview-layout'
import { moveFocusFromHiddenSearch, useSidebarPanel } from '../lib/use-sidebar-panel'
import type { Conversation } from '../types'
import { Avatar } from './Avatar'
import { ChevronDownIcon, GridIcon, PlusIcon, SearchIcon } from './Icons'

type SidebarProps = {
  conversations: Conversation[]
  activeId: string
  width: number
  onWidthChange: (width: number) => void
  onAnnounce?: (message: string) => void
  onSelect: (id: string) => void
}

export function Sidebar({
  conversations,
  activeId,
  width,
  onWidthChange,
  onAnnounce,
  onSelect,
}: SidebarProps) {
  const { panelRef, resizerProps } = useSidebarPanel({ onWidthChange, onAnnounce })
  const collapsed = isSidebarCollapsed(width)

  useEffect(() => {
    if (!collapsed || !panelRef.current) return
    moveFocusFromHiddenSearch(panelRef.current)
  }, [collapsed, panelRef])

  return (
    <aside
      ref={panelRef}
      className={collapsed ? 'grok-sidebar grok-sidebar--collapsed' : 'grok-sidebar'}
      style={{ width, flexBasis: width }}
    >
      <div
        className="sidebar-resizer"
        aria-label={collapsed ? 'Expand conversations sidebar' : 'Resize conversations sidebar'}
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
          <button type="button" className="sidebar-plus" aria-label="New conversation">
            <PlusIcon />
          </button>
        </div>
        <label className="sidebar-search">
          <span className="sr-only">Search conversations</span>
          <SearchIcon className="sidebar-search__icon" />
          <input
            type="search"
            placeholder="Search"
            className="sidebar-search__input"
          />
        </label>
      </div>

      <div className="sidebar-list-wrap">
        <nav className="sidebar-list" aria-label="Conversations">
          <ul>
            {conversations.map((conversation) => {
              const selected = conversation.id === activeId
              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className={[
                      'conversation-row',
                      selected ? 'conversation-row--active' : '',
                    ].join(' ')}
                    aria-current={selected ? 'true' : undefined}
                    aria-label={collapsed
                      ? `${conversation.title}${conversation.unread ? ', unread' : ''}`
                      : undefined}
                    title={collapsed ? conversation.title : undefined}
                  >
                    <span className="conversation-row__avatar">
                      <Avatar
                        agent={conversation.agent}
                        size={24}
                        stacked={conversation.stacked}
                        plus={conversation.stackPlus}
                      />
                      {conversation.unread ? (
                        <span className="conversation-row__badge" aria-hidden="true" />
                      ) : null}
                    </span>
                    <span className="conversation-row__copy">
                      <span className="conversation-row__topline">
                        <span className="conversation-row__name">{conversation.title}</span>
                        {conversation.time ? (
                          <span className="conversation-row__time">{conversation.time}</span>
                        ) : null}
                      </span>
                      <span className="conversation-row__bottomline">
                        <span className="conversation-row__preview">{conversation.preview}</span>
                        {conversation.unread ? (
                          <span className="conversation-row__unread" aria-hidden="true" />
                        ) : null}
                        {conversation.unread ? <span className="sr-only">Unread</span> : null}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="sidebar-unread-wrap">
          <button
            type="button"
            className="sidebar-unread"
            aria-label="More unread"
          >
            <ChevronDownIcon className="sidebar-unread__icon" />
            <span className="sidebar-unread__label">More unread</span>
          </button>
        </div>
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
