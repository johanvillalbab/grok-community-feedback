import { AGENT_META, CURRENT_USER } from '../data'
import type { AgentKey, AutonomyLevel, BotCapability, BotPermission, SettingsSection } from '../types'
import { SAMPLE_NOTE, WORKSPACE_BOTS } from '../workspace-data'
import { Avatar } from './Avatar'
import { ShieldIcon } from './Icons'
import { WorkspaceScreen } from './WorkspaceScreen'

type SettingsViewProps = {
  section: SettingsSection
  permissions: Record<AgentKey, BotPermission>
  onSection: (section: SettingsSection) => void
  onAutonomy: (agent: AgentKey, autonomy: AutonomyLevel) => void
  onCapability: (agent: AgentKey, capability: BotCapability) => void
  onApproval: (agent: AgentKey) => void
  onOpenActivity: (agent: AgentKey) => void
}

const SECTIONS: Array<{ id: SettingsSection; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'autonomy', label: 'Autonomy' },
  { id: 'permissions', label: 'Permissions' },
]

export function SettingsView({
  section,
  permissions,
  onSection,
  onAutonomy,
  onCapability,
  onApproval,
  onOpenActivity,
}: SettingsViewProps) {
  return (
    <WorkspaceScreen
      title="Workspace settings"
      parent="Configurable sample controls. Saved in this browser."
      icon={<ShieldIcon />}
    >
      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={section === item.id}
            className={section === item.id ? 'filter-chip filter-chip--active' : 'filter-chip'}
            onClick={() => onSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {section === 'profile' ? <ProfilePane onOpenActivity={onOpenActivity} /> : null}
      {section === 'autonomy' ? (
        <AutonomyPane permissions={permissions} onAutonomy={onAutonomy} onApproval={onApproval} />
      ) : null}
      {section === 'permissions' ? (
        <PermissionsPane permissions={permissions} onCapability={onCapability} />
      ) : null}
    </WorkspaceScreen>
  )
}

function ProfilePane({ onOpenActivity }: { onOpenActivity: (agent: AgentKey) => void }) {
  return (
    <article className="settings-pane">
      <div className="settings-profile">
        <Avatar agent={CURRENT_USER.agent} size={36} />
        <div>
          <h2>{CURRENT_USER.name}</h2>
          <p>Workspace operator in this prototype. No account is real.</p>
        </div>
      </div>
      <p>{SAMPLE_NOTE}</p>
      <dl className="settings-dl">
        <div>
          <dt>Role</dt>
          <dd>Community ambassador · sample</dd>
        </div>
        <div>
          <dt>Home workspace</dt>
          <dd>Atlas (local)</dd>
        </div>
        <div>
          <dt>Notifications</dt>
          <dd>In-app only. This build does not send mail.</dd>
        </div>
      </dl>
      <button type="button" className="ws-button" onClick={() => onOpenActivity('user')}>
        View operator activity
      </button>
    </article>
  )
}

function AutonomyPane({
  permissions,
  onAutonomy,
  onApproval,
}: {
  permissions: Record<AgentKey, BotPermission>
  onAutonomy: (agent: AgentKey, autonomy: AutonomyLevel) => void
  onApproval: (agent: AgentKey) => void
}) {
  return (
    <div className="settings-pane">
      <p>How far each bot may go without asking. Mass-market defaults, still configurable.</p>
      <table className="settings-table">
        <caption className="sr-only">Autonomy by bot</caption>
        <thead>
          <tr>
            <th scope="col">Bot</th>
            <th scope="col">Level</th>
            <th scope="col">Approval</th>
          </tr>
        </thead>
        <tbody>
          {WORKSPACE_BOTS.map((agent) => {
            const row = permissions[agent]
            return (
              <tr key={agent}>
                <th scope="row">
                  <span className="settings-bot">
                    <Avatar agent={agent} size={16} />
                    {AGENT_META[agent].label}
                  </span>
                </th>
                <td>
                  <label className="sr-only" htmlFor={`autonomy-${agent}`}>Autonomy for {AGENT_META[agent].label}</label>
                  <select
                    id={`autonomy-${agent}`}
                    className="settings-select"
                    value={row.autonomy}
                    onChange={(event) => onAutonomy(agent, event.target.value as AutonomyLevel)}
                  >
                    <option value="observe">Observe</option>
                    <option value="propose">Propose</option>
                    <option value="assist">Assist</option>
                    <option value="act">Act</option>
                  </select>
                </td>
                <td>
                  <label className="settings-check">
                    <input
                      type="checkbox"
                      checked={row.requireApproval}
                      onChange={() => onApproval(agent)}
                    />
                    Required
                  </label>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PermissionsPane({
  permissions,
  onCapability,
}: {
  permissions: Record<AgentKey, BotPermission>
  onCapability: (agent: AgentKey, capability: BotCapability) => void
}) {
  return (
    <div className="settings-pane">
      <p>What each bot may do with community feedback. Toggles stay in localStorage.</p>
      <table className="settings-table">
        <caption className="sr-only">Capabilities by bot</caption>
        <thead>
          <tr>
            <th scope="col">Bot</th>
            <th scope="col">Read feedback</th>
            <th scope="col">Propose</th>
            <th scope="col">Attach Canvas</th>
            <th scope="col">Notify</th>
          </tr>
        </thead>
        <tbody>
          {WORKSPACE_BOTS.map((agent) => {
            const row = permissions[agent]
            return (
              <tr key={agent}>
                <th scope="row">
                  <span className="settings-bot">
                    <Avatar agent={agent} size={16} />
                    {AGENT_META[agent].label}
                  </span>
                </th>
                <CapabilityCell agent={agent} capability="readFeedback" checked={row.capabilities.readFeedback} onCapability={onCapability} />
                <CapabilityCell agent={agent} capability="propose" checked={row.capabilities.propose} onCapability={onCapability} />
                <CapabilityCell agent={agent} capability="attachCanvas" checked={row.capabilities.attachCanvas} onCapability={onCapability} />
                <CapabilityCell agent={agent} capability="notify" checked={row.capabilities.notify} onCapability={onCapability} />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function CapabilityCell({
  agent,
  capability,
  checked,
  onCapability,
}: {
  agent: AgentKey
  capability: BotCapability
  checked: boolean
  onCapability: (agent: AgentKey, capability: BotCapability) => void
}) {
  return (
    <td>
      <label className="settings-check">
        <span className="sr-only">{capabilityLabel(capability)} for {AGENT_META[agent].label}</span>
        <input type="checkbox" checked={checked} onChange={() => onCapability(agent, capability)} />
      </label>
    </td>
  )
}

function capabilityLabel(capability: BotCapability) {
  switch (capability) {
    case 'readFeedback':
      return 'Read feedback'
    case 'propose':
      return 'Propose'
    case 'attachCanvas':
      return 'Attach Canvas'
    case 'notify':
      return 'Notify'
    default: {
      const exhaustive: never = capability
      return exhaustive
    }
  }
}
