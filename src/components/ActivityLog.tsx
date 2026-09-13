import { useState } from 'react'
import { AGENT_META } from '../data'
import type { ActivityItem, ActivityKind, AgentKey, ApprovalState } from '../types'
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
  const [eventsOnly, setEventsOnly] = useState(false)
  const workspaceItems = items.filter((item) => item.workspaceId === workspaceId)
  const visible = eventsOnly
    ? workspaceItems.filter((item) => item.kind === 'instrument')
    : agent
      ? workspaceItems.filter((item) => item.agent === agent || item.kind === 'instrument')
      : workspaceItems
  const agents = uniqueAgents(workspaceItems)

  return (
    <WorkspaceScreen
      title={agent ? `${AGENT_META[agent].label} activity` : 'Activity'}
      parent={`${workspaceName} · background work (sample)`}
      icon={<PulseIcon />}
      actions={agent ? (
        <button
          type="button"
          className="ws-button ws-button--tiny"
          onClick={() => {
            setEventsOnly(false)
            onFilterAgent(undefined)
          }}
        >
          All bots
        </button>
      ) : null}
    >
      <p className="activity-instrument-note">
        Mock events from this session show their names in the log: <code>goal_created</code>, <code>autonomy_changed</code>, <code>permission_toggled</code>, <code>context_changed</code>, <code>side_chat_opened</code>, <code>artifact_opened</code>, <code>digest_viewed</code>, <code>activity_log_opened</code>.
      </p>
      <div className="activity-filters" role="tablist" aria-label="Filter activity">
        <FilterChip
          label="Everyone"
          current={!eventsOnly && !agent}
          onClick={() => {
            setEventsOnly(false)
            onFilterAgent(undefined)
          }}
        />
        <FilterChip
          label="Events"
          current={eventsOnly}
          onClick={() => {
            setEventsOnly(true)
            onFilterAgent(undefined)
          }}
        />
        {agents.map((key) => (
          <FilterChip
            key={key}
            label={AGENT_META[key].label}
            current={!eventsOnly && agent === key}
            onClick={() => {
              setEventsOnly(false)
              onFilterAgent(key)
            }}
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
                  {item.event ? <code className="activity-event">{item.event}</code> : <strong>{item.title}</strong>}
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
    case 'instrument':
      return 'Event'
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
