import {
  AGENT_META,
  CANVASES,
  FEEDS,
  FILES,
  WORKSPACES,
  canvasesForConversation,
  type BotShapeId,
} from '../data'
import { findGroup, groupsOf, preferredThread } from './workspace-nav'
import { goalById } from '../workspace-data'
import type {
  AgentKey,
  CanvasGantt,
  CanvasNodeStatus,
  CanvasTone,
  Conversation,
  FeedItem,
  InlineToken,
  NavGroup,
  OpenArtifact,
  Workspace,
  WorkspaceCanvas,
  WorkspaceFile,
  WorkspaceSource,
} from '../types'

export type CliTone = 'text' | 'mute' | 'info' | 'ok' | 'warn'

export type CliSpan = {
  text: string
  tone?: CliTone
  color?: string
}

export type CliRow = {
  command: string
  mark: string
  markColor?: string
  title: string
  detail: string
  aside: string
  active?: boolean
  unread?: boolean
  index?: number
}

export type CliHint = {
  command: string
  about: string
  submit: boolean
}

export type GanttCell = 'done' | 'active' | 'pending' | 'empty'

export type CliBlock =
  | { type: 'facts'; rows: Array<{ label: string; value: string }> }
  | { type: 'label'; text: string }
  | { type: 'line'; spans: CliSpan[] }
  | { type: 'prose'; spans: CliSpan[] }
  | { type: 'gap' }
  | { type: 'rule'; label?: string }
  | { type: 'rows'; rows: CliRow[] }
  | { type: 'hints'; items: CliHint[] }
  | { type: 'columns'; groups: Array<{ title: string; items: CliHint[] }> }
  | { type: 'stats'; items: Array<{ value: string; label: string; tone?: CanvasTone }> }
  | { type: 'bars'; title: string; unit: string; items: Array<{ label: string; value: number; max: number }> }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; title: string; body: string }
  | {
      type: 'flow'
      title: string
      nodes: Array<{ title: string; detail: string; status: CanvasNodeStatus; owner: string; color: string }>
    }
  | {
      type: 'gantt'
      title: string
      columns: string[]
      today: number
      lanes: Array<{ title: string; color: string; cells: GanttCell[] }>
    }
  | { type: 'table'; caption: string; headers: string[]; rows: string[][]; tones: Array<CanvasTone | undefined> }
  | { type: 'code'; path: string; text: string }

export type CliEffect =
  | { type: 'stay' }
  | { type: 'clear' }
  | { type: 'exit' }
  | { type: 'settings' }
  | { type: 'navigate'; workspaceId?: string; threadId?: string; artifact?: OpenArtifact | null }

export type CliMemory = {
  threads: Conversation[]
  canvases: WorkspaceCanvas[]
  files: WorkspaceFile[]
}

export type CliContext = {
  userName: string
  workspace: Workspace
  thread: Conversation
  memory: CliMemory
}

export type CliResult = {
  blocks: CliBlock[]
  announce: string
  effect: CliEffect
  memory?: Partial<CliMemory>
}

export type CliNavigation = {
  workspaceId?: string
  threadId?: string
  artifact?: OpenArtifact | null
}

export const EMPTY_MEMORY: CliMemory = { threads: [], canvases: [], files: [] }

type CommandName =
  | 'help'
  | 'threads'
  | 'open'
  | 'search'
  | 'ws'
  | 'read'
  | 'canvas'
  | 'cat'
  | 'status'
  | 'settings'
  | 'exit'
  | 'clear'

type CommandGroup = 'move' | 'look' | 'session'

type CommandSpec = {
  name: CommandName
  aliases: readonly string[]
  blurb: string
  group: CommandGroup
  takesArgs: boolean
}

const COMMANDS: readonly CommandSpec[] = [
  { name: 'threads', aliases: ['ls', 'agents'], blurb: 'List agents and channels', group: 'move', takesArgs: true },
  { name: 'open', aliases: ['cd'], blurb: 'Open a thread', group: 'move', takesArgs: true },
  { name: 'search', aliases: [], blurb: 'Find a thread', group: 'move', takesArgs: true },
  { name: 'ws', aliases: ['workspaces'], blurb: 'Switch workspace', group: 'move', takesArgs: true },
  { name: 'read', aliases: [], blurb: 'Read this thread', group: 'look', takesArgs: false },
  { name: 'canvas', aliases: [], blurb: 'Open a canvas', group: 'look', takesArgs: true },
  { name: 'cat', aliases: ['file', 'files'], blurb: 'Open a file', group: 'look', takesArgs: true },
  { name: 'status', aliases: ['whoami'], blurb: 'Show where you are', group: 'look', takesArgs: false },
  { name: 'help', aliases: ['?', 'h'], blurb: 'List commands', group: 'session', takesArgs: false },
  { name: 'clear', aliases: [], blurb: 'Clear the screen', group: 'session', takesArgs: false },
  { name: 'settings', aliases: [], blurb: 'Return to settings', group: 'session', takesArgs: false },
  { name: 'exit', aliases: ['gui', 'quit', 'q'], blurb: 'Return to the workspace', group: 'session', takesArgs: false },
]

const MARK: Record<BotShapeId, string> = {
  cercle: '●',
  galet: '◉',
  squircle: '■',
  capsule: '▬',
  triangle: '▲',
  hexagone: '⬢',
  nuage: '❋',
  goutte: '◆',
}

const stay: CliEffect = { type: 'stay' }

export function welcomeBlocks(): CliBlock[] {
  return [
    { type: 'prose', spans: [{ text: 'Same workspace. threads lists it. read shows this thread.' }] },
    {
      type: 'hints',
      items: [
        { command: 'threads', about: 'List the workspace', submit: true },
        { command: 'read', about: 'Read this thread', submit: true },
        { command: 'help', about: 'Every command', submit: true },
      ],
    },
  ]
}

export function completionsFor(input: string, ctx: CliContext): string[] {
  const endsWithSpace = /\s$/.test(input)
  const parts = input.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return COMMANDS.map((command) => (command.takesArgs ? `${command.name} ` : command.name))
  }
  if (parts.length === 1 && !endsWithSpace) {
    const stem = parts[0]?.toLowerCase() ?? ''
    return COMMANDS.flatMap((command) => [command.name, ...command.aliases])
      .filter((name) => name.startsWith(stem))
      .map((name) => {
        const spec = resolveCommand(name)
        return spec?.takesArgs ? `${name} ` : name
      })
  }
  const spec = resolveCommand(parts[0] ?? '')
  if (!spec?.takesArgs) return []
  const arg = endsWithSpace ? '' : parts.slice(1).join(' ')
  const needle = norm(arg)
  const head = parts[0] ?? spec.name
  return argumentOptions(spec.name, ctx)
    .filter((option) => {
      if (!needle) return true
      const folded = norm(option)
      return folded.startsWith(needle) || folded.includes(needle)
    })
    .slice(0, 12)
    .map((option) => `${head} ${option}`)
}

export function runCommand(input: string, ctx: CliContext): CliResult {
  const parts = input.trim().split(/\s+/).filter(Boolean)
  const verb = parts[0] ?? ''
  const arg = parts.slice(1).join(' ')
  const spec = resolveCommand(verb)
  if (!spec) return unknownCommand(verb)
  return dispatch(spec.name, arg, ctx)
}

function dispatch(name: CommandName, arg: string, ctx: CliContext): CliResult {
  switch (name) {
    case 'help':
      return helpResult()
    case 'threads':
      return threadsCommand(arg, ctx)
    case 'open':
      return openCommand(arg, ctx)
    case 'search':
      return searchCommand(arg, ctx)
    case 'ws':
      return workspaceCommand(arg, ctx)
    case 'read':
      return { blocks: feedBlocks(ctx.thread), announce: `Reading ${ctx.thread.title}.`, effect: stay }
    case 'canvas':
      return canvasCommand(arg, ctx)
    case 'cat':
      return catCommand(arg, ctx)
    case 'status':
      return { blocks: [placeBlock(ctx)], announce: `${ctx.workspace.name}. ${ctx.thread.title}.`, effect: stay }
    case 'settings':
      return {
        blocks: [{ type: 'line', spans: [{ text: 'Opening settings.', tone: 'mute' }] }],
        announce: 'Settings open.',
        effect: { type: 'settings' },
      }
    case 'exit':
      return { blocks: [], announce: `Back in the workspace. ${ctx.thread.title}.`, effect: { type: 'exit' } }
    case 'clear':
      return { blocks: [], announce: 'Screen cleared.', effect: { type: 'clear' } }
    default: {
      const exhaustive: never = name
      return exhaustive
    }
  }
}

function helpResult(): CliResult {
  const groups: CommandGroup[] = ['move', 'look', 'session']
  return {
    blocks: [
      {
        type: 'columns',
        groups: groups.map((group) => ({
          title: groupTitle(group),
          items: COMMANDS.filter((command) => command.group === group).map((command) => ({
            command: command.name,
            about: command.blurb,
            submit: command.name !== 'open' && command.name !== 'search',
          })),
        })),
      },
      { type: 'line', spans: [{ text: 'Tab completes. Up arrow recalls. Esc closes.', tone: 'mute' }] },
    ],
    announce: 'Commands grouped into Move, Look, and Session.',
    effect: stay,
  }
}

function threadsCommand(arg: string, ctx: CliContext): CliResult {
  const groups = groupsOf(ctx.workspace)
  if (!arg) {
    return {
      blocks: summaryBlocks(groups, ctx, true),
      announce: `${groups.length} groups in ${ctx.workspace.name}.`,
      effect: stay,
    }
  }
  const picked = choose(arg, groups, (group) => [group.name, group.id, group.agent])
  if (picked.status === 'none') return miss(`No group matches "${arg}".`, 'threads')
  if (picked.status === 'many') {
    return {
      blocks: summaryBlocks(picked.items, ctx, false),
      announce: `${picked.items.length} groups match ${arg}.`,
      effect: stay,
    }
  }
  const group = picked.item
  return {
    blocks: [
      { type: 'label', text: group.kind === 'channel' ? `#${group.name}` : group.name },
      { type: 'rows', rows: group.threads.map((thread, index) => threadRow(thread, index + 1, group.threads, ctx)) },
    ],
    announce: `${group.threads.length} threads in ${group.name}.`,
    effect: stay,
    memory: { threads: group.threads },
  }
}

function openCommand(arg: string, ctx: CliContext): CliResult {
  if (!arg) {
    return {
      blocks: [
        note('Name a thread. threads lists them.'),
        { type: 'hints', items: [{ command: 'threads', about: 'List the workspace', submit: true }] },
      ],
      announce: 'Name a thread to open.',
      effect: stay,
    }
  }
  const indexed = takeIndex(arg, ctx.memory.threads)
  if (indexed.status === 'miss') return indexed.result
  if (indexed.status === 'hit') return opened(indexed.item, ctx)
  const threads = threadsIn(ctx.workspace)
  const picked = choose(arg, threads, (thread) => [thread.title, thread.id, `${thread.title} · ${thread.parentTitle}`])
  if (picked.status === 'none') return miss(`No thread matches "${arg}".`, 'threads')
  if (picked.status === 'many') {
    return {
      blocks: [
        { type: 'line', spans: [{ text: `${picked.items.length} threads match "${arg}".`, tone: 'mute' }] },
        { type: 'rows', rows: picked.items.map((thread, index) => threadRow(thread, index + 1, picked.items, ctx)) },
      ],
      announce: `${picked.items.length} threads match ${arg}.`,
      effect: stay,
      memory: { threads: picked.items },
    }
  }
  return opened(picked.item, ctx)
}

function searchCommand(arg: string, ctx: CliContext): CliResult {
  if (!arg) {
    return {
      blocks: [note('Type a word to search. Example: search preview')],
      announce: 'Type a word to search.',
      effect: stay,
    }
  }
  const hits = ranked(arg, threadsIn(ctx.workspace), (thread) => [thread.title, thread.preview, thread.parentTitle])
    .filter((row) => row.score >= 40)
    .slice(0, 8)
    .map((row) => row.item)
  if (hits.length === 0) return miss(`No thread matches "${arg}".`, 'threads')
  const noun = hits.length === 1 ? 'thread' : 'threads'
  return {
    blocks: [
      { type: 'line', spans: [{ text: `${hits.length} ${noun}` }] },
      { type: 'rows', rows: hits.map((thread, index) => threadRow(thread, index + 1, hits, ctx)) },
    ],
    announce: `${hits.length} ${noun} match ${arg}.`,
    effect: stay,
    memory: { threads: hits },
  }
}

function workspaceCommand(arg: string, ctx: CliContext): CliResult {
  const workspaces = WORKSPACES
  if (!arg) {
    return {
      blocks: [
        { type: 'label', text: 'Workspaces' },
        { type: 'rows', rows: workspaces.map((workspace) => workspaceRow(workspace, ctx)) },
      ],
      announce: `${workspaces.length} workspaces. ${ctx.workspace.name} is current.`,
      effect: stay,
    }
  }
  const picked = choose(arg, workspaces, (workspace) => [workspace.name, workspace.id])
  if (picked.status === 'none') return miss(`No workspace matches "${arg}".`, 'ws')
  if (picked.status === 'many') {
    return {
      blocks: [{ type: 'rows', rows: picked.items.map((workspace) => workspaceRow(workspace, ctx)) }],
      announce: `${picked.items.length} workspaces match ${arg}.`,
      effect: stay,
    }
  }
  const next = picked.item
  if (next.id === ctx.workspace.id) {
    return {
      blocks: [{ type: 'line', spans: [{ text: `Already in ${next.name}.`, tone: 'mute' }] }],
      announce: `Already in ${next.name}.`,
      effect: stay,
    }
  }
  const home = next.agents[0] ?? next.channels[0]
  const thread = home && home.threads.length > 0 ? preferredThread(home) : undefined
  if (!thread) {
    return { blocks: [note(`${next.name} has no threads.`)], announce: `${next.name} has no threads.`, effect: stay }
  }
  return {
    blocks: [
      { type: 'line', spans: [{ text: next.name }, { text: `  ·  ${sourceLabel(next.source)}`, tone: 'mute' }] },
      { type: 'line', spans: [{ text: thread.title, tone: 'mute' }] },
    ],
    announce: `Workspace ${next.name}. ${thread.title}.`,
    effect: { type: 'navigate', workspaceId: next.id, threadId: thread.id, artifact: null },
  }
}

function canvasCommand(arg: string, ctx: CliContext): CliResult {
  const attached = canvasesForConversation(ctx.thread.id)
  const all = Object.values(CANVASES)
  if (!arg) {
    const list = attached.length > 0 ? attached : all
    return {
      blocks: [
        {
          type: 'line',
          spans: [{
            text: attached.length > 0 ? 'Canvases on this thread' : 'This thread has no canvas. These are available.',
            tone: 'mute',
          }],
        },
        { type: 'rows', rows: list.map((canvas, index) => canvasRow(canvas, index + 1)) },
      ],
      announce: attached.length > 0 ? `${attached.length} canvases on this thread.` : 'This thread has no canvas.',
      effect: stay,
      memory: { canvases: list },
    }
  }
  const indexed = takeIndex(arg, ctx.memory.canvases)
  if (indexed.status === 'miss') return indexed.result
  if (indexed.status === 'hit') return showCanvas(indexed.item)
  const picked = choose(arg, all, (canvas) => [canvas.title, canvas.id])
  if (picked.status === 'none') return miss(`No canvas matches "${arg}".`, 'canvas')
  if (picked.status === 'many') {
    return {
      blocks: [{ type: 'rows', rows: picked.items.map((canvas, index) => canvasRow(canvas, index + 1)) }],
      announce: `${picked.items.length} canvases match ${arg}.`,
      effect: stay,
      memory: { canvases: picked.items },
    }
  }
  return showCanvas(picked.item)
}

function catCommand(arg: string, ctx: CliContext): CliResult {
  const files = Object.values(FILES)
  if (!arg) {
    return {
      blocks: [
        { type: 'label', text: 'Files' },
        { type: 'rows', rows: files.map((file, index) => fileRow(file, index + 1)) },
      ],
      announce: `${files.length} files.`,
      effect: stay,
      memory: { files },
    }
  }
  const indexed = takeIndex(arg, ctx.memory.files)
  if (indexed.status === 'miss') return indexed.result
  if (indexed.status === 'hit') return showFile(indexed.item)
  const picked = choose(arg, files, (file) => [file.name, file.id, file.path])
  if (picked.status === 'none') return miss(`No file matches "${arg}".`, 'cat')
  if (picked.status === 'many') {
    return {
      blocks: [{ type: 'rows', rows: picked.items.map((file, index) => fileRow(file, index + 1)) }],
      announce: `${picked.items.length} files match ${arg}.`,
      effect: stay,
      memory: { files: picked.items },
    }
  }
  return showFile(picked.item)
}

function opened(thread: Conversation, ctx: CliContext): CliResult {
  return {
    blocks: feedBlocks(thread),
    announce: `Opened ${thread.title}.`,
    effect: thread.id === ctx.thread.id ? stay : { type: 'navigate', threadId: thread.id, artifact: null },
  }
}

function showCanvas(canvas: WorkspaceCanvas): CliResult {
  return {
    blocks: canvasBlocks(canvas),
    announce: `Canvas ${canvas.title}.`,
    effect: { type: 'navigate', artifact: { kind: 'canvas', id: canvas.id } },
  }
}

function showFile(file: WorkspaceFile): CliResult {
  return {
    blocks: [{ type: 'code', path: file.path, text: file.content }],
    announce: `${file.name}.`,
    effect: { type: 'navigate', artifact: { kind: 'file', id: file.id } },
  }
}

function unknownCommand(verb: string): CliResult {
  const near = COMMANDS
    .map((command) => ({ name: command.name, distance: editDistance(verb.toLowerCase(), command.name) }))
    .filter((row) => row.distance > 0 && row.distance <= 2)
    .sort((a, b) => a.distance - b.distance)
  const suggestion = near[0]?.name
  const blocks: CliBlock[] = [note(`No command "${verb}".`)]
  blocks.push({
    type: 'hints',
    items: [{ command: suggestion ?? 'help', about: suggestion ? 'Closest command' : 'List commands', submit: true }],
  })
  return {
    blocks,
    announce: suggestion ? `No command ${verb}. Closest is ${suggestion}.` : `No command ${verb}.`,
    effect: stay,
  }
}

function miss(title: string, hint: string): CliResult {
  return {
    blocks: [
      note(title),
      { type: 'hints', items: [{ command: hint, about: 'Show the list', submit: true }] },
    ],
    announce: title,
    effect: stay,
  }
}

function note(text: string): CliBlock {
  return { type: 'callout', tone: 'warning', title: text, body: '' }
}

function placeBlock(ctx: CliContext): CliBlock {
  const threads = threadsIn(ctx.workspace)
  const unread = threads.filter((thread) => thread.unread).length
  return {
    type: 'facts',
    rows: [
      { label: 'You', value: ctx.userName },
      { label: 'Workspace', value: `${ctx.workspace.name} · ${sourceLabel(ctx.workspace.source)}` },
      { label: 'Thread', value: ctx.thread.title },
      { label: 'Unread', value: `${unread} of ${threads.length}` },
    ],
  }
}

function summaryBlocks(groups: NavGroup[], ctx: CliContext, withHint: boolean): CliBlock[] {
  const agents = groups.filter((group) => group.kind === 'agent')
  const channels = groups.filter((group) => group.kind === 'channel')
  const blocks: CliBlock[] = []
  if (agents.length > 0) {
    blocks.push({ type: 'label', text: 'Agents' }, { type: 'rows', rows: agents.map((group) => groupRow(group, ctx)) })
  }
  if (channels.length > 0) {
    blocks.push({ type: 'label', text: 'Channels' }, { type: 'rows', rows: channels.map((group) => groupRow(group, ctx)) })
  }
  if (withHint) {
    blocks.push({ type: 'line', spans: [{ text: 'A row opens that group. open, then a name, jumps to a thread.', tone: 'mute' }] })
  }
  return blocks
}

function groupRow(group: NavGroup, ctx: CliContext): CliRow {
  const preferred = preferredThread(group)
  const mark = groupMark(group)
  const current = findGroup(ctx.workspace, ctx.thread.id)?.id === group.id
  return {
    command: `threads ${group.name}`,
    mark: mark.glyph,
    markColor: mark.color,
    title: group.name,
    detail: preferred.title,
    aside: String(group.threads.length),
    active: current,
    unread: group.threads.some((thread) => thread.unread),
  }
}

function threadRow(thread: Conversation, index: number, peers: Conversation[], ctx: CliContext): CliRow {
  const meta = AGENT_META[thread.agent]
  return {
    command: `open ${openQuery(thread, peers)}`,
    mark: thread.kind === 'channel' ? '#' : MARK[meta.shape],
    markColor: meta.color,
    title: thread.title,
    detail: thread.preview,
    aside: thread.time,
    active: thread.id === ctx.thread.id,
    unread: thread.unread,
    index,
  }
}

function workspaceRow(workspace: Workspace, ctx: CliContext): CliRow {
  const current = workspace.id === ctx.workspace.id
  return {
    command: `ws ${workspace.name}`,
    mark: workspace.source === 'cloud' ? '◎' : '▣',
    title: workspace.name,
    detail: sourceLabel(workspace.source),
    aside: String(threadsIn(workspace).length),
    active: current,
  }
}

function canvasRow(canvas: WorkspaceCanvas, index: number): CliRow {
  return {
    command: `canvas ${canvas.title}`,
    mark: '▦',
    title: canvas.title,
    detail: canvas.summary,
    aside: String(index),
    index,
  }
}

function fileRow(file: WorkspaceFile, index: number): CliRow {
  return {
    command: `cat ${file.name}`,
    mark: '▤',
    title: file.name,
    detail: file.path,
    aside: String(index),
    index,
  }
}

function feedBlocks(thread: Conversation): CliBlock[] {
  const feed = FEEDS[thread.id] ?? []
  const blocks: CliBlock[] = [
    { type: 'label', text: thread.kind === 'channel' ? 'Channel' : 'Thread' },
    { type: 'line', spans: [{ text: thread.title }] },
    { type: 'line', spans: [{ text: `${thread.parentTitle}  ·  ${thread.time}`, tone: 'mute' }] },
    { type: 'gap' },
  ]
  const follow = new Map<string, CliHint>()
  for (const item of feed) blocks.push(...feedItemBlocks(item, follow))
  const hints = [...follow.values()].slice(0, 4)
  if (hints.length > 0) blocks.push({ type: 'gap' }, { type: 'hints', items: hints })
  return blocks
}

function feedItemBlocks(item: FeedItem, follow: Map<string, CliHint>): CliBlock[] {
  switch (item.kind) {
    case 'message':
      return item.blocks.map((paragraph) => ({
        type: 'prose' as const,
        spans: paragraph.flatMap((token) => tokenSpans(token, follow)),
      }))
    case 'thread':
      return [{ type: 'line', spans: [{ text: `${item.count} messages with ${people(item.agents)}`, tone: 'mute' }] }]
    case 'wrote':
      return [{ type: 'line', spans: [{ text: `Wrote to ${people(item.agents)}`, tone: 'mute' }] }]
    case 'new':
      return [{ type: 'rule', label: 'New' }]
    default: {
      const exhaustive: never = item
      return exhaustive
    }
  }
}

function tokenSpans(token: InlineToken, follow: Map<string, CliHint>): CliSpan[] {
  switch (token.type) {
    case 'text':
      return [{ text: token.text }]
    case 'file': {
      const file = FILES[token.fileId]
      const label = file?.name ?? token.text ?? token.fileId
      follow.set(label, { command: `cat ${label}`, about: label, submit: true })
      return [{ text: `<${label}>`, tone: 'info' }]
    }
    case 'canvas': {
      const canvas = CANVASES[token.canvasId]
      const label = canvas?.title ?? token.text ?? token.canvasId
      follow.set(`canvas:${label}`, { command: `canvas ${label}`, about: label, submit: true })
      return [{ text: `<${label}>`, tone: 'info' }]
    }
    case 'goal': {
      const goal = goalById(token.goalId)
      return [{ text: `<${token.text ?? goal?.title ?? token.goalId}>`, tone: 'mute' }]
    }
    case 'chip':
      return [{ text: `[${token.text}]`, tone: 'ok' }]
    case 'link':
      return [{ text: token.text ?? token.href, tone: 'info' }]
    default: {
      const exhaustive: never = token
      return exhaustive
    }
  }
}

function canvasBlocks(canvas: WorkspaceCanvas): CliBlock[] {
  const blocks: CliBlock[] = [
    { type: 'label', text: 'Canvas' },
    { type: 'line', spans: [{ text: canvas.title }] },
    { type: 'prose', spans: [{ text: canvas.summary, tone: 'mute' }] },
    { type: 'line', spans: [{ text: canvas.stats.map((item) => `${item.value} ${item.label}`).join(' · '), tone: 'mute' }] },
  ]
  if (canvas.callout) {
    blocks.push({ type: 'callout', tone: canvas.callout.tone, title: canvas.callout.title, body: canvas.callout.body })
  }
  if (canvas.bars) {
    blocks.push({ type: 'bars', title: canvas.bars.title, unit: canvas.bars.unit, items: canvas.bars.items })
  }
  if (canvas.flow) {
    blocks.push({
      type: 'flow',
      title: canvas.flow.title,
      nodes: canvas.flow.nodes.map((node) => ({
        title: node.title,
        detail: node.detail,
        status: node.status,
        owner: node.owner,
        color: node.agent ? AGENT_META[node.agent].color : '#9a9a9a',
      })),
    })
  }
  if (canvas.gantt) blocks.push(ganttBlock(canvas.gantt))
  if (canvas.table) {
    blocks.push({
      type: 'table',
      caption: canvas.table.caption,
      headers: canvas.table.headers,
      rows: canvas.table.rows,
      tones: canvas.table.rowTone ?? [],
    })
  }
  return blocks
}

function ganttBlock(gantt: CanvasGantt): CliBlock {
  return {
    type: 'gantt',
    title: gantt.title,
    columns: gantt.columns,
    today: gantt.today,
    lanes: gantt.lanes.map((lane) => {
      const cells: GanttCell[] = gantt.columns.map(() => 'empty')
      for (const task of gantt.tasks) {
        if (task.laneId !== lane.id) continue
        for (let offset = 0; offset < task.duration; offset += 1) {
          const index = task.start + offset
          if (index >= 0 && index < cells.length) cells[index] = task.status
        }
      }
      return { title: lane.title, color: AGENT_META[lane.agent].color, cells }
    }),
  }
}

function argumentOptions(name: CommandName, ctx: CliContext): string[] {
  switch (name) {
    case 'threads':
      return groupsOf(ctx.workspace).map((group) => group.name)
    case 'open':
      return threadsIn(ctx.workspace).map((thread) => openQuery(thread, threadsIn(ctx.workspace)))
    case 'ws':
      return WORKSPACES.map((workspace) => workspace.name)
    case 'canvas':
      return Object.values(CANVASES).map((canvas) => canvas.title)
    case 'cat':
      return Object.values(FILES).map((file) => file.name)
    case 'search':
    case 'help':
    case 'read':
    case 'status':
    case 'settings':
    case 'exit':
    case 'clear':
      return []
    default: {
      const exhaustive: never = name
      return exhaustive
    }
  }
}

function threadsIn(workspace: Workspace): Conversation[] {
  return groupsOf(workspace).flatMap((group) => group.threads)
}

function openQuery(thread: Conversation, peers: Conversation[]): string {
  const twins = peers.filter((item) => norm(item.title) === norm(thread.title))
  return twins.length > 1 ? `${thread.title} · ${thread.parentTitle}` : thread.title
}

function groupMark(group: NavGroup): { glyph: string; color: string } {
  const meta = AGENT_META[group.agent]
  return group.kind === 'channel' ? { glyph: '#', color: meta.color } : { glyph: MARK[meta.shape], color: meta.color }
}

function people(agents: AgentKey[]): string {
  const labels = [...new Set(agents.map((agent) => AGENT_META[agent].label))]
  if (labels.length <= 3) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
}

function sourceLabel(source: WorkspaceSource): string {
  switch (source) {
    case 'local':
      return 'Local'
    case 'cloud':
      return 'Shared'
    default: {
      const exhaustive: never = source
      return exhaustive
    }
  }
}

function groupTitle(group: CommandGroup): string {
  switch (group) {
    case 'move':
      return 'Move'
    case 'look':
      return 'Look'
    case 'session':
      return 'Session'
    default: {
      const exhaustive: never = group
      return exhaustive
    }
  }
}

function resolveCommand(verb: string): CommandSpec | undefined {
  const key = verb.toLowerCase()
  return COMMANDS.find((command) => command.name === key || command.aliases.some((alias) => alias === key))
}

function choose<T>(
  query: string,
  items: T[],
  texts: (item: T) => string[],
): { status: 'none' } | { status: 'one'; item: T } | { status: 'many'; items: T[] } {
  const rows = ranked(query, items, texts)
  const best = rows[0]
  const second = rows[1]
  if (!best || best.score < 40) return { status: 'none' }
  if (!second || (best.score >= 80 && second.score <= best.score - 25)) return { status: 'one', item: best.item }
  const close = rows.filter((row) => row.score >= best.score - 15 && row.score >= 40).slice(0, 8)
  if (close.length === 1 && close[0]) return { status: 'one', item: close[0].item }
  return { status: 'many', items: close.map((row) => row.item) }
}

function ranked<T>(query: string, items: T[], texts: (item: T) => string[]): Array<{ item: T; score: number }> {
  return items
    .map((item) => ({ item, score: Math.max(0, ...texts(item).map((text) => scoreText(query, text))) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
}

function takeIndex<T>(
  query: string,
  items: T[],
): { status: 'skip' } | { status: 'hit'; item: T } | { status: 'miss'; result: CliResult } {
  if (!/^\d+$/.test(query)) return { status: 'skip' }
  if (items.length === 0) {
    return {
      status: 'miss',
      result: {
        blocks: [note('There is no numbered list yet. threads, search, canvas, or cat builds one.')],
        announce: 'There is no numbered list yet.',
        effect: stay,
      },
    }
  }
  const item = items[Number(query) - 1]
  if (!item) {
    return {
      status: 'miss',
      result: {
        blocks: [note(`There is no item ${query}. This list has ${items.length}.`)],
        announce: `There is no item ${query}. This list has ${items.length}.`,
        effect: stay,
      },
    }
  }
  return { status: 'hit', item }
}

function scoreText(query: string, label: string): number {
  const q = norm(query)
  const value = norm(label)
  if (!q || !value) return 0
  if (value === q) return 100
  if (value.startsWith(q)) return 82
  if (value.includes(q)) return 64
  const tokens = q.split(' ')
  const hits = tokens.filter((token) => value.includes(token)).length
  if (hits === 0) return 0
  return 20 + Math.round((hits / tokens.length) * 40)
}

function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function editDistance(left: string, right: string): number {
  const prev = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let row = 1; row <= left.length; row += 1) {
    let corner = prev[0] ?? 0
    prev[0] = row
    for (let col = 1; col <= right.length; col += 1) {
      const current = prev[col] ?? 0
      const next = left[row - 1] === right[col - 1] ? corner : Math.min(corner, current, prev[col - 1] ?? 0) + 1
      corner = current
      prev[col] = next
    }
  }
  return prev[right.length] ?? 0
}
