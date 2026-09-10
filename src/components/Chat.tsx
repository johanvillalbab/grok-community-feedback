import type { ReactNode } from 'react'
import { CANVASES, canvasesForConversation } from '../data'
import type { Conversation, FeedItem, InlineToken } from '../types'
import { Avatar, AvatarStack } from './Avatar'
import { CanvasChip } from './CanvasChip'
import { FileChip } from './FileChip'
import { CanvasIcon, DotsIcon, HashIcon, MicIcon, MonitorIcon, PlusIcon, ReplyIcon, ShareIcon, SmileIcon } from './Icons'

type ChatProps = {
  conversation: Conversation
  feed: FeedItem[]
  activeFileId: string | null
  activeCanvasId: string | null
  onOpenFile: (fileId: string) => void
  onOpenCanvas: (canvasId: string) => void
}

export function Chat({
  conversation,
  feed,
  activeFileId,
  activeCanvasId,
  onOpenFile,
  onOpenCanvas,
}: ChatProps) {
  const canvases = canvasesForConversation(conversation.id)
  const headerCanvas = canvases[0]
  const openCanvas = activeCanvasId ? CANVASES[activeCanvasId] : undefined

  return (
    <main id="main-content" className="grok-chat" tabIndex={-1}>
      <header className="chat-header">
        <div className="chat-header__identity">
          <span aria-hidden="true">
            <ConversationGlyph conversation={conversation} />
          </span>
          <div className="chat-header__titles">
            <h1>{conversation.title}</h1>
            <p className="chat-header__parent">{conversation.parentTitle}</p>
          </div>
        </div>
        <div className="chat-header__actions">
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
          <IconButton label="Share" className="chat-header__button">
            <ShareIcon />
          </IconButton>
          <IconButton label="Open in desktop" className="chat-header__button">
            <MonitorIcon />
          </IconButton>
        </div>
      </header>

      <div className="chat-scroll">
        <div className="chat-feed">
          {feed.map((item) => (
            <FeedRow
              key={item.id}
              item={item}
              activeFileId={activeFileId}
              activeCanvasId={activeCanvasId}
              onOpenFile={onOpenFile}
              onOpenCanvas={onOpenCanvas}
            />
          ))}
        </div>
      </div>

      <div className="chat-composer">
        <div className="chat-composer__input">
          <IconButton label="Add file" className="chat-composer__button">
            <PlusIcon />
          </IconButton>
          <label className="chat-composer__field">
            <span className="sr-only">Message to {conversation.title}</span>
            <input
              type="text"
              placeholder={`Message ${conversation.title}`}
            />
          </label>
          <IconButton label="Voice message" className="chat-composer__button chat-composer__button--mic">
            <MicIcon />
          </IconButton>
        </div>
      </div>
    </main>
  )
}

function FeedRow({
  item,
  activeFileId,
  activeCanvasId,
  onOpenFile,
  onOpenCanvas,
}: {
  item: FeedItem
  activeFileId: string | null
  activeCanvasId: string | null
  onOpenFile: (fileId: string) => void
  onOpenCanvas: (canvasId: string) => void
}) {
  switch (item.kind) {
    case 'message':
      return (
        <article className={`grok-message grok-message--${item.id}`}>
          <div className="grok-message__actions">
            <IconButton label="Add reaction">
              <SmileIcon />
            </IconButton>
            <IconButton label="Reply">
              <ReplyIcon />
            </IconButton>
            <IconButton label="More actions">
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
                    onOpenFile={onOpenFile}
                    onOpenCanvas={onOpenCanvas}
                  />
                ))}
              </p>
            ))}
          </div>
        </article>
      )
    case 'thread':
      return (
        <p className="chat-meta">
          {item.count} messages with
          <AvatarStack agents={item.agents} size={12} />
          <span>{item.agents.length} Bots</span>
        </p>
      )
    case 'wrote':
      return (
        <p className="chat-meta">
          Wrote to
          <AvatarStack agents={item.agents} size={12} />
          <span>{item.count} Bots</span>
        </p>
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
  onOpenFile,
  onOpenCanvas,
}: {
  token: InlineToken
  activeFileId: string | null
  activeCanvasId: string | null
  onOpenFile: (fileId: string) => void
  onOpenCanvas: (canvasId: string) => void
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
    case 'chip':
      return <FileChip text={token.text} />
    case 'link':
      return (
        <a
          className="chat-link"
          href={token.href}
          target="_blank"
          rel="noreferrer"
        >
          {token.text ?? token.href}
        </a>
      )
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
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`chat-icon-button ${className}`}
    >
      {children}
    </button>
  )
}
