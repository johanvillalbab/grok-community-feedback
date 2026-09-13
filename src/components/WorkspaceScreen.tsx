import type { ReactNode } from 'react'
import { SAMPLE_NOTE } from '../workspace-data'

type WorkspaceScreenProps = {
  title: string
  parent: string
  icon: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function WorkspaceScreen({ title, parent, icon, actions, children }: WorkspaceScreenProps) {
  return (
    <main id="main-content" className="grok-chat workspace-screen" tabIndex={-1}>
      <header className="chat-header">
        <div className="chat-header__identity">
          <span className="workspace-screen__icon" aria-hidden="true">{icon}</span>
          <div className="chat-header__titles">
            <h1>{title}</h1>
            <p className="chat-header__parent">{parent}</p>
          </div>
        </div>
        {actions ? <div className="chat-header__actions">{actions}</div> : null}
      </header>
      <div className="chat-scroll">
        <p className="workspace-sample-note">{SAMPLE_NOTE}</p>
        {children}
      </div>
    </main>
  )
}
