import { CURRENT_USER } from '../data'
import type { Conversation } from '../types'
import { Avatar } from './Avatar'
import { GridIcon, PlusIcon, SearchIcon } from './Icons'

type SidebarProps = {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
}

export function Sidebar({ conversations, activeId, onSelect }: SidebarProps) {
  return (
    <aside className="grok-sidebar">
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
                  >
                    <Avatar
                      agent={conversation.agent}
                      size={24}
                      stacked={conversation.stacked}
                      plus={conversation.stackPlus}
                    />
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
          >
            <span aria-hidden="true">↓</span>
            More unread
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-footer__item"
        >
          <GridIcon />
          Marketplace
        </button>
        <button
          type="button"
          className="sidebar-profile"
        >
          <Avatar agent={CURRENT_USER.agent} size={18} />
          <span>{CURRENT_USER.name}</span>
        </button>
      </div>
    </aside>
  )
}
