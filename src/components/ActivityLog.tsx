import { AGENT_META } from '../data'
import type { ActivityItem, ActivityKind, AgentKey, ApprovalState } from '../types'
import { activityForWorkspace } from '../workspace-data'
import { Avatar } from './Avatar'
import { PulseIcon } from './Icons'
import { WorkspaceScreen } from './WorkspaceScreen'

type ActivityLogProps = {
  workspaceId: string
  workspaceName: string
  items: ActivityItem[]
  agent?: AgentKey
  onFilterAgent: (agent?: AgentKey) => void
  onOpenThread: (threadId: string) => void
  onOpenCanvas: (canvasId: string) => void
  onOpenFile: (fileId: string) => void
  onOpenGoal: (goalId: string) => void
  onSetApproval: (id: string, state: ApprovalState) => void
}

export function ActivityLog({
  workspaceId,
  workspaceName,
  items,
  agent,
  onFilterAgent,
  onOpenThread,
  onOpenCanvas,
  onOpenFile,
  onOpenGoal,
  onSetApproval,
}: ActivityLogProps) {
  const workspaceItems = items.filter((item) => item.workspaceId === workspaceId)
  const visible = agent ? workspaceItems.filter((item) => item.agent === agent) : workspaceItems
  const agents = uniqueAgents(activityForWorkspace(workspaceId))

  return (
    <WorkspaceScreen
      title={agent ? `${AGENT_META[agent].label} activity` : 'Activity'}
      parent={`${workspaceName} · background work (sample)`}
      icon={<PulseIcon />}
      actions={agent ? (
        <button type="button" className="ws-button ws-button--tiny" onClick={() => onFilterAgent(undefined)}>
          All bots
        </button>
      ) : null}
    >
      <div className="activity-filters" role="tablist" aria-label="Filter activity">
        <FilterChip label="Everyone" current={!agent} onClick={() => onFilterAgent(undefined)} />
        {agents.map((key) => (
          <FilterChip
            key={key}
            label={AGENT_META[key].label}
            current={agent === key}
            onClick={() => onFilterAgent(key)}
          />
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="workspace-empty">
          <h2>No sample activity here</h2>
          <p>Bots in this workspace have not posted a background action in the mock log.</p>
        </div>
      ) : (
        <ol className="activity-list">
          {visible.map((item) => (
            <li key={item.id} className="activity-item">
              <Avatar agent={item.agent} size={20} />
              <div className="activity-item__body">
                <p className="activity-item__top">
                  <strong>{item.title}</strong>
                  <span>{item.time}</span>
                </p>
                <p>{item.detail}</p>
                <p className="activity-item__meta">
                  {kindLabel(item.kind)} · {AGENT_META[item.agent].label}
                  {item.approval ? ` · ${approvalLabel(item.approval)}` : ''}
                </p>
                <div className="activity-item__actions">
                  {item.threadId ? <button type="button" className="ws-linkish" onClick={() => onOpenThread(item.threadId!)}>Thread</button> : null}
                  {item.goalId ? <button type="button" className="ws-linkish" onClick={() => onOpenGoal(item.goalId!)}>Goal</button> : null}
                  {item.canvasId ? <button type="button" className="ws-linkish" onClick={() => onOpenCanvas(item.canvasId!)}>Canvas</button> : null}
                  {item.fileId ? <button type="button" className="ws-linkish" onClick={() => onOpenFile(item.fileId!)}>File</button> : null}
                  {item.approval === 'waiting' ? (
                    <>
                      <button type="button" className="ws-button ws-button--tiny" onClick={() => onSetApproval(item.id, 'approved')}>Approve</button>
                      <button type="button" className="ws-button ws-button--tiny ws-button--ghost" onClick={() => onSetApproval(item.id, 'dismissed')}>Dismiss</button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </WorkspaceScreen>
  )
}

function FilterChip({ label, current, onClick }: { label: string; current: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={current}
      className={current ? 'filter-chip filter-chip--active' : 'filter-chip'}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function uniqueAgents(items: ActivityItem[]): AgentKey[] {
  return items
    .map((item) => item.agent)
    .filter((agent, index, list) => list.indexOf(agent) === index)
}

function kindLabel(kind: ActivityKind) {
  switch (kind) {
    case 'action':
      return 'Action'
    case 'artifact':
      return 'Artifact'
    case 'approval':
      return 'Needs approval'
    case 'background':
      return 'Background'
    default: {
      const exhaustive: never = kind
      return exhaustive
    }
  }
}

function approvalLabel(state: ApprovalState) {
  switch (state) {
    case 'waiting':
      return 'Waiting'
    case 'approved':
      return 'Approved'
    case 'dismissed':
      return 'Dismissed'
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}
