import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  EMPTY_MEMORY,
  completionsFor,
  runCommand,
  welcomeBlocks,
  type CliBlock,
  type CliContext,
  type CliHint,
  type CliMemory,
  type CliNavigation,
  type CliRow,
  type CliSpan,
  type GanttCell,
} from '../lib/cli'
import { groupsOf } from '../lib/workspace-nav'
import type { CanvasNodeStatus, CanvasTone, Conversation, Workspace } from '../types'

type CliTerminalProps = {
  active: boolean
  userName: string
  workspace: Workspace
  thread: Conversation
  onNavigate: (next: CliNavigation) => void
  onExit: () => void
  onOpenSettings: () => void
  onAnnounce: (message: string) => void
}

type Entry =
  | { id: string; kind: 'input'; text: string }
  | { id: string; kind: 'output'; blocks: CliBlock[] }

type Actions = {
  onRun: (command: string) => void
  onFill: (command: string) => void
}

export function CliTerminal({
  active,
  userName,
  workspace,
  thread,
  onNavigate,
  onExit,
  onOpenSettings,
  onAnnounce,
}: CliTerminalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const historyRef = useRef<string[]>([])
  const savedDraft = useRef('')
  const cycleRef = useRef<{ stem: string; index: number; options: string[] } | null>(null)
  const [memory, setMemory] = useState<CliMemory>(EMPTY_MEMORY)
  const [draft, setDraft] = useState('')
  const [browse, setBrowse] = useState<number | null>(null)
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: 'boot', kind: 'output', blocks: welcomeBlocks() },
  ])
  const onExitRef = useRef(onExit)
  const onOpenSettingsRef = useRef(onOpenSettings)
  const onAnnounceRef = useRef(onAnnounce)
  const onNavigateRef = useRef(onNavigate)

  useEffect(() => {
    onExitRef.current = onExit
    onOpenSettingsRef.current = onOpenSettings
    onAnnounceRef.current = onAnnounce
    onNavigateRef.current = onNavigate
  })

  const context = (): CliContext => ({ userName, workspace, thread, memory })

  const nextId = () => {
    idRef.current += 1
    return `cli-${idRef.current}`
  }

  const append = (text: string, blocks: CliBlock[]) => {
    setEntries((current) => [
      ...current,
      { id: nextId(), kind: 'input', text },
      ...(blocks.length > 0 ? [{ id: nextId(), kind: 'output' as const, blocks }] : []),
    ])
  }

  const runLine = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const ctx = context()
    const result = runCommand(text, ctx)
    const history = historyRef.current
    if (history[history.length - 1] !== text) history.push(text)
    if (history.length > 50) history.shift()
    setBrowse(null)
    setDraft('')
    cycleRef.current = null
    if (result.memory) setMemory((current) => ({ ...current, ...result.memory }))
    onAnnounceRef.current(result.announce)
    switch (result.effect.type) {
      case 'clear':
        setEntries([{ id: nextId(), kind: 'output', blocks: welcomeBlocks() }])
        return
      case 'exit':
        onExitRef.current()
        return
      case 'settings':
        append(text, result.blocks)
        onOpenSettingsRef.current()
        return
      case 'navigate':
        onNavigateRef.current({
          workspaceId: result.effect.workspaceId,
          threadId: result.effect.threadId,
          artifact: result.effect.artifact,
        })
        append(text, result.blocks)
        return
      case 'stay':
        append(text, result.blocks)
        return
      default: {
        const exhaustive: never = result.effect
        return exhaustive
      }
    }
  }

  const fillLine = (value: string) => {
    setDraft(value)
    setBrowse(null)
    cycleRef.current = null
    inputRef.current?.focus()
  }

  const welcomed = useRef(false)
  useEffect(() => {
    if (welcomed.current) return
    welcomed.current = true
    onAnnounceRef.current(`CLI open. ${workspace.name}. ${thread.title}.`)
  }, [thread.title, workspace.name])

  useEffect(() => {
    if (!active) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [active])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [entries])

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === ',' && (event.metaKey || event.ctrlKey) && !event.altKey) {
        event.preventDefault()
        onOpenSettingsRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      runLine(draft)
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      completeDraft()
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      recall(-1)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      recall(1)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (draft) {
        setDraft('')
        setBrowse(null)
        return
      }
      onExitRef.current()
      return
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      runLine('clear')
    }
  }

  const completeDraft = () => {
    const cycling = cycleRef.current
    const stem = cycling && cycling.options.includes(draft) ? cycling.stem : draft
    const options = completionsFor(stem, context()).filter((option) => option !== stem)
    if (options.length === 0) return
    if (options.length === 1) {
      const only = options[0]
      if (only) setDraft(only)
      cycleRef.current = null
      placeCaret()
      return
    }
    const index = cycling && cycling.stem === stem ? (cycling.index + 1) % options.length : 0
    if (!cycling || cycling.stem !== stem) {
      setEntries((current) => [
        ...current,
        {
          id: nextId(),
          kind: 'output',
          blocks: [{
            type: 'hints',
            items: options.map((option) => ({ command: option, about: 'Run', submit: true })),
          }],
        },
      ])
    }
    const next = options[index]
    if (next) setDraft(next)
    cycleRef.current = { stem, index, options }
    placeCaret()
  }

  const recall = (direction: -1 | 1) => {
    const history = historyRef.current
    if (history.length === 0) return
    if (direction < 0) {
      const next = browse === null ? history.length - 1 : Math.max(0, browse - 1)
      if (browse === null) savedDraft.current = draft
      setBrowse(next)
      setDraft(history[next] ?? '')
    } else if (browse === null) {
      return
    } else if (browse >= history.length - 1) {
      setBrowse(null)
      setDraft(savedDraft.current)
    } else {
      const next = browse + 1
      setBrowse(next)
      setDraft(history[next] ?? '')
    }
    placeCaret()
  }

  const threads = groupsOf(workspace).flatMap((group) => group.threads)
  const unread = threads.filter((item) => item.unread).length
  const actions: Actions = { onRun: runLine, onFill: fillLine }

  return (
    <section className="cli-screen" aria-label="CLI" inert={active ? undefined : true}>
      <header className="chat-header cli-header">
        <div className="chat-header__identity">
          <div className="chat-header__titles">
            <h1>CLI</h1>
            <p className="chat-header__parent">{workspace.name} / {thread.title}</p>
          </div>
        </div>
        <button type="button" className="cli-close" onClick={onExit}>Close</button>
      </header>
      <div ref={scrollRef} className="cli-scroll">
        {entries.map((entry) => (
          entry.kind === 'input' ? (
            <p key={entry.id} className="cli-echo">
              <span aria-hidden="true">❯ </span>
              <span>{entry.text}</span>
            </p>
          ) : (
            <div key={entry.id} className="cli-output">
              {entry.blocks.map((block, index) => (
                <BlockView key={`${entry.id}-${index}`} block={block} actions={actions} />
              ))}
            </div>
          )
        ))}
      </div>
      <div className="cli-dock">
        <p className="cli-status">
          <span>{workspace.name} · {workspace.source === 'cloud' ? 'Shared' : 'Local'}</span>
          <span className="cli-status__thread">{thread.title}</span>
          <span>{unread} unread</span>
        </p>
        <label className="cli-prompt">
          <span className="sr-only" id="cli-command-label">Command</span>
          <span className="cli-prompt__path" aria-hidden="true">{loginOf(userName)}@{workspace.id}:{thread.title}</span>
          <span aria-hidden="true">❯</span>
          <input
            ref={inputRef}
            value={draft}
            aria-labelledby="cli-command-label"
            aria-describedby="cli-command-hint"
            placeholder="threads, read, help"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) => {
              setDraft(event.target.value)
              setBrowse(null)
              cycleRef.current = null
            }}
            onKeyDown={onInputKeyDown}
          />
        </label>
        <p id="cli-command-hint" className="cli-hintline">Tab completes. Up arrow recalls. Esc closes.</p>
      </div>
    </section>
  )
}

function BlockView({ block, actions }: { block: CliBlock; actions: Actions }) {
  switch (block.type) {
    case 'facts':
      return (
        <dl className="cli-facts">
          {block.rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )
    case 'label':
      return <p className="cli-label">{block.text}</p>
    case 'line':
      return <p className="cli-line"><Spans spans={block.spans} /></p>
    case 'prose':
      return <p className="cli-prose"><Spans spans={block.spans} /></p>
    case 'gap':
      return <div className="cli-gap" />
    case 'rule':
      return (
        <div className="cli-rule" role={block.label ? 'separator' : undefined}>
          {block.label ? <b>{block.label}</b> : null}
        </div>
      )
    case 'rows':
      return (
        <div className="cli-rows">
          {block.rows.map((row) => (
            <RowButton key={`${row.command}-${row.title}-${row.index ?? ''}`} row={row} onRun={actions.onRun} />
          ))}
        </div>
      )
    case 'hints':
      return (
        <div className="cli-hints">
          {block.items.map((hint) => (
            <HintButton key={`${hint.command}-${hint.about}`} hint={hint} actions={actions} />
          ))}
        </div>
      )
    case 'columns':
      return (
        <div className="cli-columns">
          {block.groups.map((group) => (
            <section key={group.title}>
              <h2 className="cli-label">{group.title}</h2>
              {group.items.map((hint) => (
                <HintButton key={hint.command} hint={hint} actions={actions} />
              ))}
            </section>
          ))}
        </div>
      )
    case 'stats':
      return <p className="cli-line">{block.items.map((item) => `${toneMark(item.tone)} ${item.value} ${item.label}`).join(' · ')}</p>
    case 'bars':
      return (
        <div className="cli-bars">
          <p className="cli-label">{block.title}</p>
          {block.items.map((item) => {
            const pct = item.max === 0 ? 0 : Math.round((item.value / item.max) * 100)
            return (
              <div key={item.label} className="cli-bar">
                <span>{item.label}</span>
                <span className="cli-bar__track" role="img" aria-label={`${item.label}, ${item.value} ${block.unit}`}>
                  <span className="cli-bar__fill" style={{ '--w': pct / 100 } as CSSProperties} />
                </span>
                <span>{item.value}</span>
              </div>
            )
          })}
        </div>
      )
    case 'callout':
      return (
        <p className={`cli-callout cli-callout--${block.tone}`}>
          <span className="cli-callout__title">{block.title}</span>
          {block.body ? <span className="cli-callout__body">{block.body}</span> : null}
        </p>
      )
    case 'flow':
      return (
        <div className="cli-flow">
          <p className="cli-label">{block.title}</p>
          <ol>
            {block.nodes.map((node) => (
              <li key={node.title} className={`cli-flow__item cli-flow__item--${node.status}`}>
                <span className="cli-flow__mark" style={{ color: node.color }} aria-hidden="true">{statusMark(node.status)}</span>
                <span>
                  <span className="cli-flow__title">{node.title}</span>
                  <span className="cli-flow__meta">{statusLabel(node.status)} · {node.owner}</span>
                  <span className="cli-flow__detail">{node.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )
    case 'gantt':
      return <GanttView block={block} />
    case 'table':
      return (
        <table className="cli-table">
          <caption>{block.caption}</caption>
          <thead>
            <tr>{block.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.join('|')}>
                {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'code':
      return (
        <div className="cli-code">
          <p className="cli-code__path">{block.path}</p>
          <pre>{block.text}</pre>
        </div>
      )
    default: {
      const exhaustive: never = block
      return exhaustive
    }
  }
}

function GanttView({ block }: { block: Extract<CliBlock, { type: 'gantt' }> }) {
  return (
    <div className="cli-gantt-wrap">
      <p className="cli-label">{block.title}</p>
      <div className="cli-gantt-scroll">
        <table className="cli-gantt">
          <caption className="sr-only">{block.title}. Solid is done. Striped is now. Outline is waiting.</caption>
          <thead>
            <tr>
              <th scope="col">Bot</th>
              {block.columns.map((column, index) => (
                <th key={column} scope="col" className={index === block.today ? 'is-today' : undefined}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.lanes.map((lane) => (
              <tr key={lane.title}>
                <th scope="row">{lane.title}</th>
                {lane.cells.map((cell, index) => (
                  <td key={`${lane.title}-${index}`}>
                    <span className={`cli-gantt__cell cli-gantt__cell--${cell}`} style={{ '--mark': lane.color } as CSSProperties}>
                      <span className="sr-only">{cellLabel(cell)}{index === block.today ? ', today' : ''}</span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cli-legend">Solid is done. Striped is now. Outline is waiting.</p>
    </div>
  )
}

function RowButton({ row, onRun }: { row: CliRow; onRun: (command: string) => void }) {
  return (
    <button
      type="button"
      className={row.active ? 'cli-row cli-row--active' : 'cli-row'}
      onClick={() => onRun(row.command)}
    >
      {row.unread ? <span className="sr-only">Unread. </span> : null}
      {row.active ? <span className="sr-only">Current. </span> : null}
      {row.index ? <span className="cli-row__index">{row.index}</span> : null}
      <span className="cli-row__mark" style={{ color: row.markColor }} aria-hidden="true">{row.mark}</span>
      <span className="cli-row__title">{row.title}</span>
      <span className="cli-row__detail">{row.detail}</span>
      <span className="cli-row__aside">
        {row.unread ? <span aria-hidden="true">● </span> : null}
        {row.aside}
      </span>
    </button>
  )
}

function HintButton({ hint, actions }: { hint: CliHint; actions: Actions }) {
  return (
    <button
      type="button"
      className="cli-hint"
      onClick={() => (hint.submit ? actions.onRun(hint.command) : actions.onFill(`${hint.command} `))}
    >
      <span className="cli-hint__cmd">{hint.command}</span>
      <span className="cli-hint__about">{hint.about}</span>
    </button>
  )
}

function Spans({ spans }: { spans: CliSpan[] }) {
  return spans.map((span, index) => (
    <span key={index} className={span.tone ? `cli-tone cli-tone--${span.tone}` : undefined} style={span.color ? { color: span.color } : undefined}>
      {span.text}
    </span>
  ))
}

function placeCaret() {
  window.requestAnimationFrame(() => {
    const node = document.activeElement
    if (!(node instanceof HTMLInputElement)) return
    const end = node.value.length
    node.setSelectionRange(end, end)
  })
}

function loginOf(name: string): string {
  return name.split(/\s+/)[0]?.toLowerCase() || 'grok'
}

function toneMark(tone: CanvasTone | undefined): string {
  switch (tone) {
    case 'success':
      return '✓'
    case 'warning':
      return '▲'
    case 'info':
      return '◇'
    case 'neutral':
    case undefined:
      return '·'
    default: {
      const exhaustive: never = tone
      return exhaustive
    }
  }
}

function statusMark(status: CanvasNodeStatus): string {
  switch (status) {
    case 'done':
      return '✓'
    case 'active':
      return '●'
    case 'pending':
      return '○'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

function statusLabel(status: CanvasNodeStatus): string {
  switch (status) {
    case 'done':
      return 'Done'
    case 'active':
      return 'Now'
    case 'pending':
      return 'Waiting'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

function cellLabel(cell: GanttCell): string {
  switch (cell) {
    case 'done':
      return 'Done'
    case 'active':
      return 'Now'
    case 'pending':
      return 'Waiting'
    case 'empty':
      return 'Open'
    default: {
      const exhaustive: never = cell
      return exhaustive
    }
  }
}
