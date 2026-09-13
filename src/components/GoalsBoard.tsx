import { AGENT_META } from '../data'
import type { GoalStatus, ProductGoal } from '../types'
import { goalsForWorkspace } from '../workspace-data'
import { Avatar } from './Avatar'
import { FlagIcon } from './Icons'
import { WorkspaceScreen } from './WorkspaceScreen'

type GoalsBoardProps = {
  workspaceId: string
  workspaceName: string
  selectedId?: string
  extraGoals: ProductGoal[]
  onSelect: (goalId: string) => void
  onCreate: () => void
  onOpenThread: (threadId: string) => void
  onOpenCanvas: (canvasId: string) => void
}

export function GoalsBoard({
  workspaceId,
  workspaceName,
  selectedId,
  extraGoals,
  onSelect,
  onCreate,
  onOpenThread,
  onOpenCanvas,
}: GoalsBoardProps) {
  const goals = [
    ...extraGoals.filter((goal) => goal.workspaceId === workspaceId),
    ...goalsForWorkspace(workspaceId),
  ]
  const selected = goals.find((goal) => goal.id === selectedId) ?? goals[0]

  return (
    <WorkspaceScreen
      title="Goals"
      parent={`${workspaceName} · sample roadmap`}
      icon={<FlagIcon />}
      actions={(
        <button type="button" className="ws-button ws-button--tiny" onClick={onCreate}>
          New sample goal
        </button>
      )}
    >
      {goals.length === 0 ? (
        <EmptyGoals onCreate={onCreate} />
      ) : (
        <div className="goals-layout">
          <ul className="goals-list" aria-label="Product goals">
            {goals.map((goal) => (
              <li key={goal.id}>
                <button
                  type="button"
                  className={goal.id === selected?.id ? 'goal-card goal-card--active' : 'goal-card'}
                  onClick={() => onSelect(goal.id)}
                  aria-current={goal.id === selected?.id ? 'true' : undefined}
                >
                  <span className="goal-card__top">
                    <Avatar agent={goal.owner} size={18} />
                    <span className={`goal-status goal-status--${goal.status}`}>{statusLabel(goal.status)}</span>
                  </span>
                  <strong>{goal.title}</strong>
                  <span className="goal-card__summary">{goal.summary}</span>
                  <span className="goal-progress" role="meter" aria-label={`Progress ${goal.progress} percent`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={goal.progress}>
                    <span style={{ width: `${goal.progress}%` }} />
                  </span>
                  <span className="goal-card__meta">{goal.progress}% · {AGENT_META[goal.owner].label}</span>
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <GoalDetail
              goal={selected}
              onOpenThread={onOpenThread}
              onOpenCanvas={onOpenCanvas}
            />
          ) : null}
        </div>
      )}
    </WorkspaceScreen>
  )
}

function GoalDetail({
  goal,
  onOpenThread,
  onOpenCanvas,
}: {
  goal: ProductGoal
  onOpenThread: (threadId: string) => void
  onOpenCanvas: (canvasId: string) => void
}) {
  return (
    <article className="goal-detail" aria-labelledby="goal-detail-title">
      <p className="goal-detail__kicker">Plan</p>
      <h2 id="goal-detail-title">{goal.title}</h2>
      <p>{goal.summary}</p>
      <p className="goal-detail__owners">
        Owner <Avatar agent={goal.owner} size={16} /> {AGENT_META[goal.owner].label}
      </p>
      <ol className="goal-plan">
        {goal.plan.map((step) => (
          <li key={step.id}>
            <span className={`goal-status goal-status--${step.status}`}>{statusLabel(step.status)}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.note}</p>
              <p className="goal-plan__owner">{AGENT_META[step.owner].label}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="goal-detail__actions">
        {goal.threadId ? (
          <button type="button" className="ws-button" onClick={() => onOpenThread(goal.threadId!)}>
            Open related thread
          </button>
        ) : null}
        {goal.canvasId ? (
          <button type="button" className="ws-button ws-button--ghost" onClick={() => onOpenCanvas(goal.canvasId!)}>
            Open plan canvas
          </button>
        ) : null}
      </div>
    </article>
  )
}

function EmptyGoals({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="workspace-empty">
      <h2>No sample goals in this workspace</h2>
      <p>Atlas, Masterclass, and Craft Lab each ship with a short fictional roadmap.</p>
      <button type="button" className="ws-button" onClick={onCreate}>New sample goal</button>
    </div>
  )
}

function statusLabel(status: GoalStatus) {
  switch (status) {
    case 'planned':
      return 'Planned'
    case 'active':
      return 'Active'
    case 'blocked':
      return 'Blocked'
    case 'done':
      return 'Done'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}
