import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { CANVASES, canvasesForConversation } from '../data'
import { EXTERNAL_PREVIEWS } from '../workspace-data'
import type { Conversation, FeedItem, InlineToken, SideRoom } from '../types'
import { Avatar, AvatarStack } from './Avatar'
import { CanvasChip } from './CanvasChip'
import { FileChip } from './FileChip'
import { GoalChip } from './GoalChip'
import {
  ArchiveIcon,
  CanvasIcon,
  DotsIcon,
  FlagIcon,
  HashIcon,
  MicIcon,
  MonitorIcon,
  PlusIcon,
  PulseIcon,
  ReplyIcon,
  ShareIcon,
  SmileIcon,
} from './Icons'

type ChatProps = {
  conversation: Conversation
  feed: FeedItem[]
  rooms: SideRoom[]
  activeRoom: SideRoom | null
  activeFileId: string | null
  activeCanvasId: string | null
  activeGoalId?: string
  reactions: Record<string, string[]>
  onOpenFile: (fileId: string) => void
  onOpenCanvas: (canvasId: string) => void
  onOpenGoal: (goalId: string) => void
  onSelectRoom: (roomId: string | null) => void
  onNewRoom: () => void
  onRenameRoom: (roomId: string) => void
  onArchiveRoom: (roomId: string) => void
  onRestoreRoom: (roomId: string) => void
  onShare: () => void
  onDesktop: () => void
  onAddFile: () => void
  onVoice: () => void
  onSend: (text: string) => void
  onReaction: (messageId: string) => void
  onReply: () => void
  onMore: (messageId: string) => void
  onIdentity: () => void
  onActivity: () => void
  onChip: (label: string) => void
  onExternalLink: (href: string, title: string) => void
}

export function Chat({
  conversation,
  feed,
  rooms,
  activeRoom,
  activeFileId,
  activeCanvasId,
  activeGoalId,
  reactions,
  onOpenFile,
  onOpenCanvas,
  onOpenGoal,
  onSelectRoom,
  onNewRoom,
  onRenameRoom,
  onArchiveRoom,
  onRestoreRoom,
  onShare,
  onDesktop,
  onAddFile,
  onVoice,
  onSend,
  onReaction,
  onReply,
  onMore,
  onIdentity,
  onActivity,
  onChip,
  onExternalLink,
}: ChatProps) {
  const canvases = canvasesForConversation(conversation.id)
  const headerCanvas = canvases[0]
  const openCanvas = activeCanvasId ? CANVASES[activeCanvasId] : undefined
  const openRooms = rooms.filter((room) => room.status === 'open')
  const archivedRooms = rooms.filter((room) => room.status === 'archived')
  const [draft, setDraft] = useState('')

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <main id="main-content" className="grok-chat" tabIndex={-1}>
      <header className="chat-header">
        <button type="button" className="chat-header__identity chat-header__identity--button" onClick={onIdentity}>
          <span aria-hidden="true">
            <ConversationGlyph conversation={conversation} />
          </span>
          <div className="chat-header__titles">
            <h1>{activeRoom ? activeRoom.title : conversation.title}</h1>
            <p className="chat-header__parent">
              {activeRoom ? `${conversation.title} · side room` : conversation.parentTitle}
            </p>
          </div>
        </button>
        <div className="chat-header__actions">
          <IconButton label="Activity" className="chat-header__button" onClick={onActivity}>
            <PulseIcon />
          </IconButton>
          <IconButton label="Open Goals" className="chat-header__button" onClick={() => onOpenGoal('')}>
            <FlagIcon />
          </IconButton>
          {headerCanvas ? (
            <button
              type="button"
              className={[
                'chat-icon-button',
                'chat-header__button',
                activeCanvasId ? 'chat-header__button--active' : '',
              ].join(' ')}
              aria-label={openCanvas ? `Canvas open: ${openCanvas.title}` : `Open canvas: ${headerCanvas.title}`}
              aria-expanded={Boolean(activeCanvasId)}
              aria-controls={activeCanvasId ? 'workspace-canvas-panel' : undefined}
              onClick={() => onOpenCanvas(activeCanvasId ?? headerCanvas.id)}
            >
              <CanvasIcon />
            </button>
          ) : null}
          <IconButton label="Share" className="chat-header__button" onClick={onShare}>
            <ShareIcon />
          </IconButton>
          <IconButton label="Open in desktop" className="chat-header__button" onClick={onDesktop}>
            <MonitorIcon />
          </IconButton>
        </div>
      </header>

      <div className="room-strip" aria-label="Main thread and side rooms">
        <button
          type="button"
          className={!activeRoom ? 'room-tab room-tab--active' : 'room-tab'}
          aria-current={!activeRoom ? 'page' : undefined}
          onClick={() => onSelectRoom(null)}
        >
          Main
        </button>
        {openRooms.map((room) => (
          <span key={room.id} className="room-tab-wrap">
            <button
              type="button"
              className={activeRoom?.id === room.id ? 'room-tab room-tab--active' : 'room-tab'}
              aria-current={activeRoom?.id === room.id ? 'page' : undefined}
              onClick={() => onSelectRoom(room.id)}
            >
              {room.title}
              {room.unread ? <span className="room-tab__unread" /> : null}
            </button>
            {activeRoom?.id === room.id ? (
              <span className="room-tab__tools">
                <button type="button" className="ws-linkish" onClick={() => onRenameRoom(room.id)}>Rename</button>
                <button type="button" className="ws-linkish" onClick={() => onArchiveRoom(room.id)}>
                  <ArchiveIcon />
                  <span className="sr-only">Archive {room.title}</span>
                </button>
              </span>
            ) : null}
          </span>
        ))}
        <button type="button" className="room-tab room-tab--new" onClick={onNewRoom}>
          <PlusIcon />
          New room
        </button>
      </div>
      {archivedRooms.length > 0 ? (
        <div className="room-archived">
          {archivedRooms.map((room) => (
            <button key={room.id} type="button" className="ws-linkish" onClick={() => onRestoreRoom(room.id)}>
              Restore {room.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="chat-scroll">
        <div className="chat-feed">
          {feed.length === 0 ? (
            <div className="workspace-empty">
              <h2>This room is empty</h2>
              <p>Send a sample note or attach a file. Nothing is stored off this browser.</p>
            </div>
          ) : null}
          {feed.map((item) => (
            <FeedRow
              key={item.id}
              item={item}
              activeFileId={activeFileId}
              activeCanvasId={activeCanvasId}
              activeGoalId={activeGoalId}
              reactions={reactions[item.id] ?? []}
              onOpenFile={onOpenFile}
              onOpenCanvas={onOpenCanvas}
              onOpenGoal={onOpenGoal}
              onReaction={() => onReaction(item.id)}
              onReply={onReply}
              onMore={() => onMore(item.id)}
              onChip={onChip}
              onExternalLink={onExternalLink}
            />
          ))}
        </div>
      </div>

      <form className="chat-composer" onSubmit={submit}>
        <div className="chat-composer__input">
          <IconButton label="Add file" className="chat-composer__button" onClick={onAddFile}>
            <PlusIcon />
          </IconButton>
          <label className="chat-composer__field">
            <span className="sr-only">Message to {activeRoom ? activeRoom.title : conversation.title}</span>
            <input
              type="text"
              placeholder={`Message ${activeRoom ? activeRoom.title : conversation.title}`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter' && !event.shiftKey) submit()
              }}
            />
          </label>
          <IconButton label="Voice message" className="chat-composer__button chat-composer__button--mic" onClick={onVoice}>
            <MicIcon />
          </IconButton>
        </div>
      </form>
    </main>
  )
}

function FeedRow({
  item,
  activeFileId,
  activeCanvasId,
  activeGoalId,
  reactions,
  onOpenFile,
  onOpenCanvas,
  onOpenGoal,
  onReaction,
  onReply,
  onMore,
  onChip,
  onExternalLink,
}: {
  item: FeedItem
  activeFileId: string | null
  activeCanvasId: string | null
  activeGoalId?: string
  reactions: string[]
  onOpenFile: (fileId: string) => void
  onOpenCanvas: (canvasId: string) => void
  onOpenGoal: (goalId: string) => void
  onReaction: () => void
  onReply: () => void
  onMore: () => void
  onChip: (label: string) => void
  onExternalLink: (href: string, title: string) => void
}) {
  switch (item.kind) {
    case 'message':
      return (
        <article className={`grok-message grok-message--${item.id}`}>
          <div className="grok-message__actions">
            <IconButton label="Add reaction" onClick={onReaction}>
              <SmileIcon />
            </IconButton>
            <IconButton label="Reply" onClick={onReply}>
              <ReplyIcon />
            </IconButton>
            <IconButton label="More actions" onClick={onMore}>
              <DotsIcon />
            </IconButton>
          </div>
          <div className="grok-message__content">
            {item.blocks.map((block, index) => (
              <p key={index}>
                {block.map((token, tokenIndex) => (
                  <Inline
                    key={tokenIndex}
                    token={token}
                    activeFileId={activeFileId}
                    activeCanvasId={activeCanvasId}
                    activeGoalId={activeGoalId}
                    onOpenFile={onOpenFile}
                    onOpenCanvas={onOpenCanvas}
                    onOpenGoal={onOpenGoal}
                    onChip={onChip}
                    onExternalLink={onExternalLink}
                  />
                ))}
              </p>
            ))}
            {reactions.length > 0 ? (
              <p className="message-reactions">
                {reactions.map((itemReaction) => (
                  <span key={itemReaction}>{itemReaction}</span>
                ))}
              </p>
            ) : null}
          </div>
        </article>
      )
    case 'thread':
      return (
        <button type="button" className="chat-meta chat-meta--button" onClick={onReply}>
          {item.count} messages with
          <AvatarStack agents={item.agents} size={12} />
          <span>{item.agents.length} Bots</span>
        </button>
      )
    case 'wrote':
      return (
        <button type="button" className="chat-meta chat-meta--button" onClick={onReply}>
          Wrote to
          <AvatarStack agents={item.agents} size={12} />
          <span>{item.count} Bots</span>
        </button>
      )
    case 'new':
      return (
        <div className="new-divider" role="separator" aria-label="New messages">
          <span />
          <b>NEW</b>
          <span />
        </div>
      )
    default: {
      const exhaustive: never = item
      return exhaustive
    }
  }
}

function Inline({
  token,
  activeFileId,
  activeCanvasId,
  activeGoalId,
  onOpenFile,
  onOpenCanvas,
  onOpenGoal,
  onChip,
  onExternalLink,
}: {
  token: InlineToken
  activeFileId: string | null
  activeCanvasId: string | null
  activeGoalId?: string
  onOpenFile: (fileId: string) => void
  onOpenCanvas: (canvasId: string) => void
  onOpenGoal: (goalId: string) => void
  onChip: (label: string) => void
  onExternalLink: (href: string, title: string) => void
}) {
  switch (token.type) {
    case 'text':
      return token.text
    case 'file':
      return (
        <FileChip
          fileId={token.fileId}
          text={token.text}
          active={activeFileId === token.fileId}
          onOpen={onOpenFile}
        />
      )
    case 'canvas':
      return (
        <CanvasChip
          canvasId={token.canvasId}
          text={token.text}
          active={activeCanvasId === token.canvasId}
          onOpen={onOpenCanvas}
        />
      )
    case 'goal':
      return (
        <GoalChip
          goalId={token.goalId}
          text={token.text}
          active={activeGoalId === token.goalId}
          onOpen={onOpenGoal}
        />
      )
    case 'chip':
      return (
        <FileChip
          text={token.text}
          onOpen={() => onChip(token.text)}
        />
      )
    case 'link': {
      const preview = EXTERNAL_PREVIEWS[token.href]
      if (preview) {
        return (
          <button type="button" className="chat-link chat-link--button" onClick={() => onOpenFile(preview.fileId)}>
            {token.text ?? preview.title}
          </button>
        )
      }
      return (
        <button
          type="button"
          className="chat-link chat-link--button"
          onClick={() => onExternalLink(token.href, token.text ?? token.href)}
        >
          {token.text ?? token.href}
        </button>
      )
    }
    default: {
      const exhaustive: never = token
      return exhaustive
    }
  }
}

function ConversationGlyph({ conversation }: { conversation: Conversation }) {
  switch (conversation.kind) {
    case 'channel':
      return <HashIcon className="chat-header__hash" />
    case 'agent':
      return <Avatar agent={conversation.agent} size={22} />
    default: {
      const exhaustive: never = conversation.kind
      return exhaustive
    }
  }
}

function IconButton({
  label,
  children,
  className = '',
  onClick,
}: {
  label: string
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`chat-icon-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
