import type { DigestCard } from '../types'
import { digestForWorkspace } from '../workspace-data'
import { SparkIcon } from './Icons'
import { WorkspaceScreen } from './WorkspaceScreen'

type DigestViewProps = {
  workspaceId: string
  workspaceName: string
  dismissedIds: string[]
  onDismiss: (id: string) => void
  onOpenGoal: (goalId: string) => void
  onOpenCanvas: (canvasId: string) => void
  onOpenThread: (threadId: string) => void
}

export function DigestView({
  workspaceId,
  workspaceName,
  dismissedIds,
  onDismiss,
  onOpenGoal,
  onOpenCanvas,
  onOpenThread,
}: DigestViewProps) {
  const cards = digestForWorkspace(workspaceId).filter((card) => !dismissedIds.includes(card.id))

  return (
    <WorkspaceScreen
      title="Proactive digest"
      parent={`${workspaceName} · suggested next moves`}
      icon={<SparkIcon />}
    >
      {cards.length === 0 ? (
        <div className="workspace-empty">
          <h2>No open digest cards</h2>
          <p>Every sample suggestion in this workspace was dismissed, or this workspace has none.</p>
        </div>
      ) : (
        <ul className="digest-grid">
          {cards.map((card) => (
            <li key={card.id}>
              <DigestCardView
                card={card}
                onDismiss={onDismiss}
                onOpenGoal={onOpenGoal}
                onOpenCanvas={onOpenCanvas}
                onOpenThread={onOpenThread}
              />
            </li>
          ))}
        </ul>
      )}
    </WorkspaceScreen>
  )
}

function DigestCardView({
  card,
  onDismiss,
  onOpenGoal,
  onOpenCanvas,
  onOpenThread,
}: {
  card: DigestCard
  onDismiss: (id: string) => void
  onOpenGoal: (goalId: string) => void
  onOpenCanvas: (canvasId: string) => void
  onOpenThread: (threadId: string) => void
}) {
  return (
    <article className={`digest-card digest-card--${card.tone}`}>
      <p className="digest-card__cluster">{card.cluster}</p>
      <h2>{card.title}</h2>
      <p>{card.suggestion}</p>
      <p className="digest-card__evidence">{card.evidence}</p>
      <div className="digest-card__actions">
        {card.goalId ? <button type="button" className="ws-button ws-button--tiny" onClick={() => onOpenGoal(card.goalId!)}>Open goal</button> : null}
        {card.canvasId ? <button type="button" className="ws-button ws-button--tiny ws-button--ghost" onClick={() => onOpenCanvas(card.canvasId!)}>Open artifact</button> : null}
        {card.threadId ? <button type="button" className="ws-linkish" onClick={() => onOpenThread(card.threadId!)}>Thread</button> : null}
        <button type="button" className="ws-linkish" onClick={() => onDismiss(card.id)}>Dismiss</button>
      </div>
    </article>
  )
}
