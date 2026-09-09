import { useLayoutEffect, useRef, useState } from 'react'
import { AGENT_META } from '../data'
import type { CanvasGantt, CanvasNodeStatus, GanttLane, GanttTask } from '../types'
import { Avatar } from './Avatar'

const COL_WIDTH = 32
const LINK_STUB = 10
const LINK_RADIUS = 7

type Point = {
  x: number
  y: number
}

type BarBox = {
  id: string
  left: number
  right: number
  top: number
  bottom: number
  cy: number
}

type GanttLink = {
  id: string
  fromId: string
  toId: string
  d: string
}

type GanttBoardProps = {
  canvasId: string
  gantt: CanvasGantt
  selectedId: string | null
  onSelect: (id: string) => void
}

export function GanttBoard({ canvasId, gantt, selectedId, onSelect }: GanttBoardProps) {
  const selected = gantt.tasks.find((task) => task.id === selectedId)
  const nextTask = selected?.handoffTo
    ? gantt.tasks.find((task) => task.id === selected.handoffTo)
    : undefined
  const nextLane = nextTask
    ? gantt.lanes.find((lane) => lane.id === nextTask.laneId)
    : undefined
  const handoffTargetId = nextTask?.id ?? null
  const boardRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [links, setLinks] = useState<GanttLink[]>([])

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    const next = measureGanttLinks(board, gantt.tasks)
    setLinks((prev) => (sameLinkPaths(prev, next) ? prev : next))
  })

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    const measure = () => {
      const next = measureGanttLinks(board, gantt.tasks)
      setLinks((prev) => (sameLinkPaths(prev, next) ? prev : next))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(board)
    return () => observer.disconnect()
  }, [gantt.tasks])

  return (
    <section className="canvas-section" aria-labelledby={`${canvasId}-gantt-title`}>
      <div className="canvas-section__head">
        <h2 id={`${canvasId}-gantt-title`}>{gantt.title}</h2>
        <p>Day {gantt.today + 1} of {gantt.columns.length}</p>
      </div>

      <div
        className="gantt-scroller"
        role="region"
        tabIndex={0}
        aria-labelledby={`${canvasId}-gantt-title`}
      >
        <div
          ref={boardRef}
          className="gantt"
          style={{
            ['--gantt-days' as string]: String(gantt.columns.length),
            ['--gantt-col' as string]: `${COL_WIDTH}px`,
            ['--gantt-today' as string]: String(gantt.today),
          }}
        >
          <svg className="gantt__links" aria-hidden="true">
            {paintOrder(links, selectedId, hoveredId).map((link) => (
              <path
                key={link.id}
                d={link.d}
                className={linkClass(link, selectedId, hoveredId)}
              />
            ))}
          </svg>
          <div className="gantt__head" aria-hidden="true">
            <span>Activity</span>
            {gantt.columns.map((column, index) => (
              <span
                key={column}
                className={index === gantt.today ? 'gantt__day gantt__day--today' : 'gantt__day'}
              >
                {column}
              </span>
            ))}
          </div>

          {gantt.lanes.map((lane) => {
            const tasks = gantt.tasks.filter((task) => task.laneId === lane.id)
            if (tasks.length === 0) return null
            return (
              <div key={lane.id} className="gantt__lane">
                <p className="gantt__lane-title">{lane.title}</p>
                {tasks.map((task) => (
                  <GanttRow
                    key={task.id}
                    task={task}
                    lane={lane}
                    days={gantt.columns.length}
                    today={gantt.today}
                    selected={task.id === selectedId}
                    handoffTarget={task.id === handoffTargetId}
                    onHover={setHoveredId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )
          })}
          <div className="gantt__today" aria-hidden="true">
            <span>Now</span>
          </div>
        </div>
      </div>

      {selected ? (
        <div className="canvas-selected" aria-live="polite">
          <p>
            <b>{selected.title}</b>
            <span className={`canvas-status canvas-status--${selected.status}`}>
              {statusLabel(selected.status)}
            </span>
          </p>
          <p>{selected.detail}</p>
          <p className="canvas-selected__owner">
            {laneTitle(gantt.lanes, selected.laneId)}
          </p>
          {selected.passes ? (
            <p className="gantt-handoff">
              Passes <b>{selected.passes}</b>
              {nextTask && nextLane
                ? ` to ${nextLane.title} for ${nextTask.title}`
                : nextTask
                  ? ` to ${nextTask.title}`
                  : ' as the close of the plan'}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function GanttRow({
  task,
  lane,
  days,
  today,
  selected,
  handoffTarget,
  onHover,
  onSelect,
}: {
  task: GanttTask
  lane: GanttLane
  days: number
  today: number
  selected: boolean
  handoffTarget: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}) {
  const color = AGENT_META[lane.agent].color
  const startDay = task.start + 1
  const endDay = task.start + task.duration
  const name = `${task.title}, ${lane.title}, days ${startDay} to ${endDay}, ${statusLabel(task.status)}`
  const rowClass = [
    'gantt__row',
    selected ? 'gantt__row--selected' : '',
    handoffTarget ? 'gantt__row--handoff' : '',
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={rowClass}
      aria-label={name}
      aria-current={selected ? 'true' : undefined}
      onMouseEnter={() => onHover(task.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(task.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(task.id)}
    >
      <span className="gantt__label">
        <Avatar agent={lane.agent} size={12} />
        <span>
          <strong>{task.title}</strong>
          <em>{statusLabel(task.status)}</em>
        </span>
      </span>
      <span className="gantt__track" aria-hidden="true">
        {Array.from({ length: days }, (_, index) => (
          <span
            key={index}
            className={index === today ? 'gantt__cell gantt__cell--today' : 'gantt__cell'}
          />
        ))}
        <span
          className={[
            'gantt__bar',
            `gantt__bar--${task.status}`,
            selected ? 'gantt__bar--selected' : '',
            handoffTarget ? 'gantt__bar--handoff' : '',
          ].join(' ')}
          data-gantt-bar={task.id}
          style={{
            left: task.start * COL_WIDTH + 2,
            width: Math.max(task.duration * COL_WIDTH - 4, 12),
            background: color,
            borderColor: color,
          }}
        />
      </span>
    </button>
  )
}

function measureGanttLinks(board: HTMLElement, tasks: GanttTask[]): GanttLink[] {
  const boardBox = board.getBoundingClientRect()
  const scale = boardBox.width / board.offsetWidth
  const boxes = new Map<string, BarBox>()

  for (const el of board.querySelectorAll<HTMLElement>('[data-gantt-bar]')) {
    const box = el.getBoundingClientRect()
    boxes.set(el.dataset.ganttBar ?? '', {
      id: el.dataset.ganttBar ?? '',
      left: snap((box.left - boardBox.left) / scale),
      right: snap((box.right - boardBox.left) / scale),
      top: snap((box.top - boardBox.top) / scale),
      bottom: snap((box.bottom - boardBox.top) / scale),
      cy: snap((box.top + box.height / 2 - boardBox.top) / scale),
    })
  }

  const all = [...boxes.values()]
  const bundle = new Map<string, number>()

  return tasks.flatMap((task) => {
    if (!task.handoffTo) return []
    const from = boxes.get(task.id)
    const to = boxes.get(task.handoffTo)
    if (!from || !to) return []
    const index = bundle.get(task.handoffTo) ?? 0
    bundle.set(task.handoffTo, index + 1)
    return [{
      id: `${task.id}-${task.handoffTo}`,
      fromId: task.id,
      toId: task.handoffTo,
      d: cablePath(from, to, all, index),
    }]
  })
}

function cablePath(from: BarBox, to: BarBox, bars: BarBox[], bundleIndex: number) {
  return roundedPolyline(cableWaypoints(from, to, bars, bundleIndex), LINK_RADIUS)
}

function cableWaypoints(from: BarBox, to: BarBox, bars: BarBox[], bundleIndex: number): Point[] {
  const start = { x: from.right, y: from.cy }
  const end = { x: to.left, y: to.cy }

  if (Math.abs(from.cy - to.cy) < 1) {
    return [start, end]
  }

  const channel = gutterX(from, to, bars, bundleIndex)
  if (channel !== null) {
    return [start, { x: channel, y: from.cy }, { x: channel, y: to.cy }, end]
  }

  return wrapWaypoints(from, to, bundleIndex)
}

function gutterX(from: BarBox, to: BarBox, bars: BarBox[], bundleIndex: number) {
  if (to.left - from.right < LINK_RADIUS * 2) return null
  const mid = (from.right + to.left) / 2
  const options = [mid, from.right + 3, to.left - 3]
  const x = options.find((value) => isClearChannel(value, from.cy, to.cy, bars, from.id, to.id))
  if (x === undefined) return null
  if (bundleIndex === 0) return snap(x)
  const left = x - bundleIndex * 3
  const right = x + bundleIndex * 3
  if (isClearChannel(left, from.cy, to.cy, bars, from.id, to.id)) return snap(left)
  if (isClearChannel(right, from.cy, to.cy, bars, from.id, to.id)) return snap(right)
  return snap(x)
}

function wrapWaypoints(from: BarBox, to: BarBox, bundleIndex: number): Point[] {
  const down = to.cy >= from.cy
  const xOut = snap(from.right + LINK_STUB + bundleIndex * 4)
  const xIn = snap(Math.min(to.left - 4, xOut - LINK_RADIUS * 2))
  const minRun = LINK_RADIUS * 2 + 2
  let yAlley = down
    ? (from.bottom + to.top) / 2
    : (to.bottom + from.top) / 2

  if (down) {
    yAlley = Math.min(Math.max(yAlley, from.cy + minRun), to.cy - minRun)
  } else {
    yAlley = Math.max(Math.min(yAlley, from.cy - minRun), to.cy + minRun)
  }

  if ((down && yAlley <= from.cy) || (!down && yAlley >= from.cy)) {
    return [
      { x: from.right, y: from.cy },
      { x: xOut, y: from.cy },
      { x: xOut, y: to.cy },
      { x: to.right, y: to.cy },
    ]
  }

  return [
    { x: from.right, y: from.cy },
    { x: xOut, y: from.cy },
    { x: xOut, y: snap(yAlley) },
    { x: xIn, y: snap(yAlley) },
    { x: xIn, y: to.cy },
    { x: to.left, y: to.cy },
  ]
}

function roundedPolyline(points: Point[], radius: number) {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 1; index < points.length - 1; index += 1) {
    const prev = points[index - 1]
    const curr = points[index]
    const next = points[index + 1]
    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y)
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y)
    const corner = Math.min(radius, inLen / 2, outLen / 2)
    if (corner < 1) {
      path += ` L ${curr.x} ${curr.y}`
      continue
    }

    const inX = (curr.x - prev.x) / inLen
    const inY = (curr.y - prev.y) / inLen
    const outX = (next.x - curr.x) / outLen
    const outY = (next.y - curr.y) / outLen
    const sweep = inX * outY - inY * outX > 0 ? 1 : 0
    path += ` L ${curr.x - inX * corner} ${curr.y - inY * corner}`
    path += ` A ${corner} ${corner} 0 0 ${sweep} ${curr.x + outX * corner} ${curr.y + outY * corner}`
  }

  const last = points[points.length - 1]
  path += ` L ${last.x} ${last.y}`
  return path
}

function isClearChannel(
  x: number,
  y1: number,
  y2: number,
  bars: BarBox[],
  fromId: string,
  toId: string,
) {
  return bars.every((bar) => {
    if (bar.id === fromId || bar.id === toId) {
      return x <= bar.left + 0.5 || x >= bar.right - 0.5
    }
    const hitsX = x > bar.left + 0.5 && x < bar.right - 0.5
    const hitsY = y1 < bar.bottom && y2 > bar.top
    return !(hitsX && hitsY)
  })
}

function sameLinkPaths(prev: GanttLink[], next: GanttLink[]) {
  return prev.length === next.length && prev.every((link, index) => (
    link.id === next[index]?.id && link.d === next[index]?.d
  ))
}

function related(link: GanttLink, id: string | null) {
  return Boolean(id && (link.fromId === id || link.toId === id))
}

function paintOrder(links: GanttLink[], selectedId: string | null, hoveredId: string | null) {
  return [...links].sort((a, b) => {
    const aHot = related(a, selectedId) || related(a, hoveredId)
    const bHot = related(b, selectedId) || related(b, hoveredId)
    if (aHot === bHot) return 0
    return aHot ? 1 : -1
  })
}

function linkClass(link: GanttLink, selectedId: string | null, hoveredId: string | null) {
  const isActive = related(link, selectedId)
  const isHot = !isActive && related(link, hoveredId)
  const isDim = Boolean(selectedId && !isActive)
  return [
    'gantt-link',
    isActive ? 'gantt-link--active' : '',
    isHot ? 'gantt-link--hot' : '',
    isDim ? 'gantt-link--dim' : '',
  ].filter(Boolean).join(' ')
}

function snap(value: number) {
  return Math.round(value) + 0.5
}

function laneTitle(lanes: GanttLane[], id: string) {
  return lanes.find((lane) => lane.id === id)?.title ?? id
}

function statusLabel(status: CanvasNodeStatus) {
  switch (status) {
    case 'done':
      return 'Done'
    case 'active':
      return 'In progress'
    case 'pending':
      return 'Waiting'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}
