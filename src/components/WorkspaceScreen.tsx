import type { ReactNode } from 'react'
import { SAMPLE_NOTE } from '../workspace-data'
import { MenuIcon } from './Icons'

type WorkspaceScreenProps = {
  title: string
  parent: string
  icon: ReactNode
  actions?: ReactNode
  children: ReactNode
  onOpenNav?: () => void
  onBack?: () => void
}

export function WorkspaceScreen({
  title,
  parent,
  icon,
  actions,
  children,
  onOpenNav,
  onBack,
}: WorkspaceScreenProps) {
  return (
    <main id="main-content" className="grok-chat workspace-screen" tabIndex={-1}>
      <header className="chat-header">
        {onOpenNav ? (
          <button
            type="button"
            className="chat-icon-button chat-header__button chat-header__menu"
            aria-label="Open workspace menu"
            onClick={onOpenNav}
          >
            <MenuIcon />
          </button>
        ) : null}
        <div className="chat-header__identity">
          <span className="workspace-screen__icon" aria-hidden="true">{icon}</span>
          <div className="chat-header__titles">
            <h1>{title}</h1>
            <p className="chat-header__parent">{parent}</p>
          </div>
        </div>
        <div className="chat-header__actions">
          {actions}
          {onBack ? (
            <button type="button" className="ws-button ws-button--tiny chat-header__back" onClick={onBack}>
              Thread
            </button>
          ) : null}
        </div>
      </header>
      <div className="chat-scroll">
        <p className="workspace-sample-note">{SAMPLE_NOTE}</p>
        {children}
      </div>
    </main>
  )
}
