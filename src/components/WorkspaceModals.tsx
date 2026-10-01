import { useState } from 'react'
import { AGENT_META, CANVASES, CURRENT_USER, FILES } from '../data'
import type { AgentKey, Conversation, SideRoom, Workspace } from '../types'
import { CHIP_FILES, REACTIONS } from '../workspace-data'
import type { WorkspaceController } from '../lib/use-workspace'
import { Avatar } from './Avatar'
import { ModalShell } from './ModalShell'

type WorkspaceModalsProps = {
  workspace: WorkspaceController
  phone?: boolean
}

export function WorkspaceModals({ workspace, phone = false }: WorkspaceModalsProps) {
  const modal = workspace.modal
  if (!modal) return null

  switch (modal.kind) {
    case 'compose':
      return (
        <ComposeModal
          sheet={phone}
          onClose={() => workspace.setModal(null)}
          onThread={() => workspace.setModal({ kind: 'new-thread' })}
          onGroup={() => workspace.setModal({ kind: 'new-room' })}
          onGoal={() => workspace.setModal({ kind: 'new-goal' })}
        />
      )
    case 'new-goal':
      return (
        <NewGoalModal
          sheet={phone}
          onClose={() => workspace.setModal(null)}
          onCreate={workspace.createGoal}
        />
      )
    case 'new-thread':
      return <NewThreadModal sheet={phone} workspace={workspace.workspace} onClose={() => workspace.setModal(null)} onCreate={workspace.createThread} />
    case 'share':
      return (
        <ModalShell sheet={phone} title="Share thread" subtitle="Sample share sheet. Nothing leaves this browser." onClose={() => workspace.setModal(null)}>
          <p>Copy a fictional link for {workspace.conversation.title}.</p>
          <code className="ws-code">atlas://{workspace.workspace.id}/{workspace.conversation.id}</code>
          <p>Suggested readers: Product Manager, Community Manager, Design Engineer.</p>
        </ModalShell>
      )
    case 'desktop':
      return (
        <ModalShell
          sheet={phone}
          title="Computer"
          subtitle="Status, preview, and takeover. This prototype stays in the browser."
          onClose={() => workspace.setModal(null)}
        >
          <p>The computer belongs to the bot. This thread shows three access levels without forcing you to supervise:</p>
          <ol className="computer-levels">
            <li><strong>Status.</strong> The header icon turns purple while the computer is active.</li>
            <li><strong>Preview.</strong> On a wide window, open a file or canvas rail beside the conversation.</li>
            <li><strong>Takeover.</strong> {phone ? 'On a phone, that preview becomes a full-screen sheet. Close it to return to the thread.' : 'When the bot needs help, the preview can grow to fill the window.'}</li>
          </ol>
          {phone ? (
            <p className="computer-desktop-only">Computer updates are not available on this phone view. Use a desktop-width window to update, recover, or reset the mock computer.</p>
          ) : (
            <p>Computer updates stay on this wide window in the prototype. There is no recover or reset action yet.</p>
          )}
          <p>A native desktop app would reopen Atlas on {workspace.conversation.title} with the same mock files. There is no native app in this repository.</p>
        </ModalShell>
      )
    case 'add-file':
      return <AddFileModal sheet={phone} onClose={() => workspace.setModal(null)} onPick={(fileId) => {
        workspace.appendMessage(
          { threadId: workspace.conversation.id, roomId: workspace.activeRoomId ?? undefined },
          'Attached a sample file:',
          { fileId },
        )
        workspace.openFile(fileId)
        workspace.setModal(null)
      }} />
    case 'voice':
      return <VoiceModal sheet={phone} onClose={() => workspace.setModal(null)} onInsert={(text) => {
        workspace.appendMessage(
          { threadId: workspace.conversation.id, roomId: workspace.activeRoomId ?? undefined },
          text,
        )
        workspace.setModal(null)
      }} />
    case 'reaction':
      return (
        <ModalShell sheet={phone} title="Add reaction" onClose={() => workspace.setModal(null)}>
          <div className="reaction-row">
            {REACTIONS.map((item) => (
              <button key={item} type="button" className="reaction-pick" onClick={() => workspace.addReaction(modal.messageId, item)}>
                {item}
              </button>
            ))}
          </div>
        </ModalShell>
      )
    case 'more':
      return (
        <MoreModal
          sheet={phone}
          conversation={workspace.conversation}
          onClose={() => workspace.setModal(null)}
          onReply={() => {
            workspace.setModal(null)
            workspace.createRoom('Reply room', `Follow-up from ${workspace.conversation.title}`)
          }}
          onShare={() => workspace.setModal({ kind: 'share' })}
          onGoal={() => workspace.openSurface({ kind: 'goals' })}
        />
      )
    case 'new-room':
      return <RoomFormModal sheet={phone} title="New group chat" onClose={() => workspace.setModal(null)} onSubmit={workspace.createRoom} />
    case 'rename-room':
      return (
        <RoomFormModal
          sheet={phone}
          title="Rename side room"
          initialTitle={workspace.threadRooms.find((room) => room.id === modal.roomId)?.title ?? ''}
          onClose={() => workspace.setModal(null)}
          onSubmit={(title) => workspace.renameRoom(modal.roomId, title)}
        />
      )
    case 'bot-detail':
      return (
        <BotDetailModal
          sheet={phone}
          agent={modal.agent}
          rooms={workspace.rooms}
          onClose={() => workspace.setModal(null)}
          onActivity={() => {
            workspace.setModal(null)
            workspace.openSurface({ kind: 'activity', agent: modal.agent })
          }}
          onSettings={() => {
            workspace.setModal(null)
            workspace.openSettings('autonomy')
          }}
        />
      )
    case 'chip-ref':
      return (
        <ChipRefModal
          sheet={phone}
          label={modal.label}
          onClose={() => workspace.setModal(null)}
          onOpenFile={(id) => {
            workspace.openFile(id)
            workspace.setModal(null)
          }}
        />
      )
    case 'external-link':
      return (
        <ModalShell sheet={phone} title={modal.title} subtitle="Fictional link. This app does not leave the workspace." onClose={() => workspace.setModal(null)}>
          <p>The thread pointed at:</p>
          <code className="ws-code">{modal.href}</code>
          <p>Open the in-app sample instead of a live page.</p>
        </ModalShell>
      )
    default: {
      const exhaustive: never = modal
      return exhaustive
    }
  }
}

function ComposeModal({
  sheet,
  onClose,
  onThread,
  onGroup,
  onGoal,
}: {
  sheet?: boolean
  onClose: () => void
  onThread: () => void
  onGroup: () => void
  onGoal: () => void
}) {
  return (
    <ModalShell
      sheet={sheet}
      title="New"
      subtitle="Organize without leaving the conversation."
      onClose={onClose}
    >
      <ul className="ws-pick-list">
        <li>
          <button type="button" className="ws-pick" onClick={onThread}>
            <strong>New thread</strong>
            <span>Start a sample conversation under an agent or channel.</span>
          </button>
        </li>
        <li>
          <button type="button" className="ws-pick" onClick={onGroup}>
            <strong>New group chat</strong>
            <span>Fork a side room from this thread. The main transcript stays put.</span>
          </button>
        </li>
        <li>
          <button type="button" className="ws-pick" onClick={onGoal}>
            <strong>New sample goal</strong>
            <span>Add a plan item and write goal_created to Activity.</span>
          </button>
        </li>
      </ul>
    </ModalShell>
  )
}

function NewGoalModal({
  sheet,
  onClose,
  onCreate,
}: {
  sheet?: boolean
  onClose: () => void
  onCreate: (title: string) => void
}) {
  const [title, setTitle] = useState('')
  return (
    <ModalShell
      sheet={sheet}
      title="New sample goal"
      subtitle="Creates a mock goal and writes goal_created to the Activity log."
      onClose={onClose}
      footer={(
        <button
          type="button"
          className="ws-button"
          disabled={!title.trim()}
          onClick={() => onCreate(title.trim())}
        >
          Create goal
        </button>
      )}
    >
      <label className="ws-field">
        <span>Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Name the leftover preview artifact"
        />
      </label>
      <p>The goal stays in this browser. Open Activity afterward to see <code>goal_created</code>.</p>
    </ModalShell>
  )
}

function NewThreadModal({
  sheet,
  workspace,
  onClose,
  onCreate,
}: {
  sheet?: boolean
  workspace: Workspace
  onClose: () => void
  onCreate: (groupId: string, title: string) => void
}) {
  const groups = [...workspace.agents, ...workspace.channels]
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '')
  const [title, setTitle] = useState('')

  return (
    <ModalShell
      sheet={sheet}
      title="New thread"
      subtitle="Creates a sample conversation in this workspace."
      onClose={onClose}
      footer={(
        <button
          type="button"
          className="ws-button"
          disabled={!title.trim() || !groupId}
          onClick={() => onCreate(groupId, title.trim())}
        >
          Create thread
        </button>
      )}
    >
      <label className="ws-field">
        <span>Parent</span>
        <select className="settings-select" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.kind === 'channel' ? `#${group.name}` : group.name}
            </option>
          ))}
        </select>
      </label>
      <label className="ws-field">
        <span>Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="About follow-up" />
      </label>
    </ModalShell>
  )
}

function AddFileModal({ sheet, onClose, onPick }: { sheet?: boolean; onClose: () => void; onPick: (fileId: string) => void }) {
  return (
    <ModalShell sheet={sheet} title="Add file" subtitle="Attach a sample workspace file to this thread." onClose={onClose}>
      <ul className="ws-pick-list">
        {Object.values(FILES).map((file) => (
          <li key={file.id}>
            <button type="button" className="ws-pick" onClick={() => onPick(file.id)}>
              <strong>{file.name}</strong>
              <span>{file.path}</span>
            </button>
          </li>
        ))}
      </ul>
    </ModalShell>
  )
}

function VoiceModal({ sheet, onClose, onInsert }: { sheet?: boolean; onClose: () => void; onInsert: (text: string) => void }) {
  return (
    <ModalShell
      sheet={sheet}
      title="Voice message"
      subtitle="Sample capture. Nothing is recorded."
      onClose={onClose}
      footer={(
        <button
          type="button"
          className="ws-button"
          onClick={() => onInsert('Transcribed sample: keep About on identity, and name the next artifact in the digest.')}
        >
          Insert transcript
        </button>
      )}
    >
      <div className="voice-bars" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} style={{ height: `${8 + ((index * 17) % 18)}px` }} />
        ))}
      </div>
      <p>A desktop mic would land here. Use the transcript to drop a mock note into the thread.</p>
    </ModalShell>
  )
}

function MoreModal({
  sheet,
  conversation,
  onClose,
  onReply,
  onShare,
  onGoal,
}: {
  sheet?: boolean
  conversation: Conversation
  onClose: () => void
  onReply: () => void
  onShare: () => void
  onGoal: () => void
}) {
  return (
    <ModalShell sheet={sheet} title="Message actions" subtitle={conversation.title} onClose={onClose}>
      <ul className="ws-pick-list">
        <li><button type="button" className="ws-pick" onClick={onReply}><strong>Reply in a side room</strong><span>Keep the main thread clear.</span></button></li>
        <li><button type="button" className="ws-pick" onClick={onShare}><strong>Share thread</strong><span>Open the sample share sheet.</span></button></li>
        <li><button type="button" className="ws-pick" onClick={onGoal}><strong>Open Goals</strong><span>See the plan this conversation sits on.</span></button></li>
      </ul>
    </ModalShell>
  )
}

function RoomFormModal({
  sheet,
  title,
  initialTitle = '',
  onClose,
  onSubmit,
}: {
  sheet?: boolean
  title: string
  initialTitle?: string
  onClose: () => void
  onSubmit: (title: string, topic: string) => void
}) {
  const [name, setName] = useState(initialTitle)
  const [topic, setTopic] = useState('')
  return (
    <ModalShell
      sheet={sheet}
      title={title}
      onClose={onClose}
      footer={(
        <button type="button" className="ws-button" disabled={!name.trim()} onClick={() => onSubmit(name.trim(), topic.trim() || 'Scoped sample conversation')}>
          Save room
        </button>
      )}
    >
      <label className="ws-field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Semantic review" />
      </label>
      <label className="ws-field">
        <span>Topic</span>
        <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="What this room is for" />
      </label>
    </ModalShell>
  )
}

function BotDetailModal({
  sheet,
  agent,
  rooms,
  onClose,
  onActivity,
  onSettings,
}: {
  sheet?: boolean
  agent: AgentKey
  rooms: SideRoom[]
  onClose: () => void
  onActivity: () => void
  onSettings: () => void
}) {
  const meta = agent === 'user' ? { label: CURRENT_USER.name, color: AGENT_META.user.color } : AGENT_META[agent]
  const owned = rooms.filter((room) => room.owner === agent && room.status === 'open')
  return (
    <ModalShell sheet={sheet} title={meta.label} subtitle="Bot detail · sample identity" onClose={onClose}>
      <div className="settings-profile">
        <Avatar agent={agent} size={36} />
        <div>
          <p>Face color {meta.color}. Click through to activity or autonomy without leaving the workspace.</p>
        </div>
      </div>
      {owned.length > 0 ? (
        <p>{owned.length} open side room{owned.length === 1 ? '' : 's'} in this workspace.</p>
      ) : (
        <p>No open side rooms owned by this bot in the sample.</p>
      )}
      <div className="goal-detail__actions">
        <button type="button" className="ws-button" onClick={onActivity}>Activity log</button>
        <button type="button" className="ws-button ws-button--ghost" onClick={onSettings}>Autonomy settings</button>
      </div>
    </ModalShell>
  )
}

function ChipRefModal({
  sheet,
  label,
  onClose,
  onOpenFile,
}: {
  sheet?: boolean
  label: string
  onClose: () => void
  onOpenFile: (fileId: string) => void
}) {
  const fileId = CHIP_FILES[label]
  const file = fileId ? FILES[fileId] : undefined
  const canvas = Object.values(CANVASES).find((item) => item.title === label)
  return (
    <ModalShell sheet={sheet} title={label} subtitle="Sample reference chip" onClose={onClose}>
      <p>This chip is a named artifact in the thread, not a dead label.</p>
      {file ? (
        <button type="button" className="ws-button" onClick={() => onOpenFile(file.id)}>
          Open {file.name}
        </button>
      ) : canvas ? (
        <p>Related canvas: {canvas.title}. Open it from Artifacts if you need the board.</p>
      ) : (
        <p>No extra file is attached. The label still stands as a sample token.</p>
      )}
    </ModalShell>
  )
}
