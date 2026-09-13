import { useEffect, useMemo, useState } from 'react'
import type { CanvasFlowNode, CanvasTone, WorkspaceCanvas } from '../types'
import { computeDAGLayout } from '../lib/dag-layout'
import { isEditableTarget } from '../lib/keyboard'
import { useSidePanel } from '../lib/use-side-panel'
import { GanttBoard } from './GanttBoard'
import { CloseIcon, CanvasIcon, PlanIcon } from './Icons'

type CanvasPanelProps = {
  canvas: WorkspaceCanvas
  width: number
  onWidthChange: (width: number) => void
  onClose: () => void
}

const NODE_WIDTH = 128
const NODE_HEIGHT = 52

export function CanvasPanel({ canvas, width, onWidthChange, onClose }: CanvasPanelProps) {
  const { panelRef, resizerProps } = useSidePanel(onWidthChange)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const fallbackNodeId = canvas.gantt?.tasks.find((task) => task.status === 'active')?.id
    ?? canvas.gantt?.tasks[0]?.id
    ?? canvas.flow?.nodes.find((node) => node.status === 'active')?.id
    ?? canvas.flow?.nodes[0]?.id
    ?? null
  const activeNodeId = (
    canvas.gantt?.tasks.some((task) => task.id === selectedId)
    || canvas.flow?.nodes.some((node) => node.id === selectedId)
  )
    ? selectedId
    : fallbackNodeId

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isEditableTarget(event.target)) return
      event.preventDefault()
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const selected = canvas.flow?.nodes.find((node) => node.id === activeNodeId)

  return (
    <aside
      ref={panelRef}
      id="workspace-canvas-panel"
      aria-labelledby="workspace-canvas-title"
      className="preview-panel canvas-panel"
      style={{ width, flexBasis: width }}
    >
      <div
        className="preview-panel__resizer"
        aria-label="Resize canvas"
        aria-valuenow={width}
        {...resizerProps}
      />
      <header className="preview-panel__header">
        <div className="preview-panel__heading">
          <p>
            {canvas.gantt ? <PlanIcon /> : <CanvasIcon />}
            <span id="workspace-canvas-title">{canvas.title}</span>
          </p>
          <p>{canvas.source}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close canvas"
          className="preview-panel__close"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="preview-panel__content canvas-panel__content">
        <p className="canvas-lead">{canvas.summary}</p>

        {canvas.stats.length > 0 ? (
          <ul className="canvas-stats" aria-label="Canvas metrics">
            {canvas.stats.map((stat) => (
              <li key={stat.label} className={stat.tone ? `canvas-stat canvas-stat--${stat.tone}` : 'canvas-stat'}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {canvas.callout ? (
          <div role="note" className={`canvas-callout canvas-callout--${canvas.callout.tone}`}>
            <p className="canvas-callout__tone">{calloutTone(canvas.callout.tone)}</p>
            <strong>{canvas.callout.title}</strong>
            <p>{canvas.callout.body}</p>
          </div>
        ) : null}

        {canvas.gantt ? (
          <GanttBoard
            canvasId={canvas.id}
            gantt={canvas.gantt}
            selectedId={activeNodeId}
            onSelect={setSelectedId}
          />
        ) : null}

        {canvas.flow ? (
          <FlowBoard
            title={canvas.flow.title}
            nodes={canvas.flow.nodes}
            edges={canvas.flow.edges}
            direction={canvas.flow.direction}
            selectedId={activeNodeId}
            onSelect={setSelectedId}
          />
        ) : null}

        {selected && !canvas.gantt ? <SelectedNode node={selected} /> : null}

        {canvas.bars ? (
          <section className="canvas-section" aria-labelledby={`${canvas.id}-bars-title`}>
            <div className="canvas-section__head">
              <h2 id={`${canvas.id}-bars-title`}>{canvas.bars.title}</h2>
              <p>{canvas.bars.unit}</p>
            </div>
            <ul className="canvas-bars">
              {canvas.bars.items.map((item) => {
                const percent = Math.max(0, Math.min(100, (item.value / item.max) * 100))
                return (
                  <li key={item.label}>
                    <div>
                      <span>{item.label}</span>
                      <b>{item.value}</b>
                    </div>
                    <div
                      className="canvas-bar"
                      role="meter"
                      aria-label={`${item.label}: ${item.value} ${canvas.bars?.unit ?? ''}`}
                      aria-valuemin={0}
                      aria-valuemax={item.max}
                      aria-valuenow={item.value}
                    >
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        {canvas.quotes ? (
          <section className="canvas-section" aria-labelledby={`${canvas.id}-quotes-title`}>
            <h2 id={`${canvas.id}-quotes-title`}>{canvas.quotes.title}</h2>
            <ul className="canvas-quotes">
              {canvas.quotes.items.map((item) => (
                <li key={item.quote}>
                  <blockquote>{item.quote}</blockquote>
                  <cite>{item.source}</cite>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {canvas.checklist ? (
          <section className="canvas-section" aria-labelledby={`${canvas.id}-check-title`}>
            <h2 id={`${canvas.id}-check-title`}>{canvas.checklist.title}</h2>
            <ul className="canvas-check">
              {canvas.checklist.items.map((item) => (
                <li key={item.label} className={item.done ? 'canvas-check__item canvas-check__item--done' : 'canvas-check__item'}>
                  <span aria-hidden="true">{item.done ? '●' : '○'}</span>
                  <div>
                    <strong>{item.label}</strong>
                    {item.owner ? <p>{item.owner}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {canvas.table ? (
          <section className="canvas-section" aria-labelledby={`${canvas.id}-table-title`}>
            <h2 id={`${canvas.id}-table-title`}>{canvas.table.caption}</h2>
            <div
              className="canvas-table-wrap"
              role="region"
              tabIndex={0}
              aria-labelledby={`${canvas.id}-table-title`}
            >
              <table className="canvas-table" aria-labelledby={`${canvas.id}-table-title`}>
                <thead>
                  <tr>
                    {canvas.table.headers.map((header) => (
                      <th key={header} scope="col">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {canvas.table.rows.map((row, index) => (
                    <tr key={row.join('-')} className={toneClass(canvas.table?.rowTone?.[index])}>
                      {row.map((cell, cellIndex) => (
                        cellIndex === 0 ? (
                          <th key={`${row[0]}-${cellIndex}`} scope="row">{cell}</th>
                        ) : (
                          <td key={`${row[0]}-${cellIndex}`}>{cell}</td>
                        )
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </aside>
  )
}

function FlowBoard({
  title,
  nodes,
  edges,
  direction,
  selectedId,
  onSelect,
}: {
  title: string
  nodes: CanvasFlowNode[]
  edges: Array<{ from: string; to: string }>
  direction: 'horizontal' | 'vertical'
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const layout = useMemo(
    () => computeDAGLayout({
      nodes: nodes.map((node) => ({ id: node.id })),
      edges,
      direction,
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT,
      rankGap: 28,
      nodeGap: 12,
      padding: 8,
    }),
    [nodes, edges, direction],
  )

  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  )

  return (
    <section className="canvas-section" aria-labelledby="canvas-flow-title">
      <div className="canvas-section__head">
        <h2 id="canvas-flow-title">{title}</h2>
        <p>{nodes.filter((node) => node.status === 'done').length} of {nodes.length} done</p>
      </div>
      <div className="canvas-flow">
        <div className="canvas-flow__board" style={{ width: layout.width, height: layout.height }}>
        <svg
          className="canvas-flow__edges"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          aria-hidden="true"
        >
          {layout.edges.map((edge) => {
            const midX = (edge.sourceX + edge.targetX) / 2
            const path = `M ${edge.sourceX} ${edge.sourceY} C ${midX} ${edge.sourceY}, ${midX} ${edge.targetY}, ${edge.targetX} ${edge.targetY}`
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={path}
                className={edge.isBackEdge ? 'canvas-edge canvas-edge--back' : 'canvas-edge'}
              />
            )
          })}
        </svg>
        {layout.nodes.map((placed) => {
          const node = nodeById.get(placed.id)
          if (!node) return null
          const selected = node.id === selectedId
          return (
            <button
              key={node.id}
              type="button"
              className={[
                'canvas-node',
                `canvas-node--${node.status}`,
                selected ? 'canvas-node--selected' : '',
              ].join(' ')}
              style={{
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                transform: `translate(${placed.x}px, ${placed.y}px)`,
              }}
              aria-current={selected ? 'true' : undefined}
              onClick={() => onSelect(node.id)}
            >
              <span className="canvas-node__title">{node.title}</span>
              <span className={`canvas-status canvas-status--${node.status}`}>{statusLabel(node.status)}</span>
            </button>
          )
        })}
        </div>
      </div>
    </section>
  )
}

function SelectedNode({ node }: { node: CanvasFlowNode }) {
  return (
    <div className="canvas-selected">
      <p>
        <b>{node.title}</b>
        <span className={`canvas-status canvas-status--${node.status}`}>{statusLabel(node.status)}</span>
      </p>
      <p>{node.detail}</p>
      <p className="canvas-selected__owner">{node.owner}</p>
    </div>
  )
}

function statusLabel(status: CanvasFlowNode['status']) {
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

function calloutTone(tone: 'info' | 'warning' | 'success') {
  switch (tone) {
    case 'info':
      return 'Note'
    case 'warning':
      return 'Warning'
    case 'success':
      return 'Ready'
    default: {
      const exhaustive: never = tone
      return exhaustive
    }
  }
}

function toneClass(tone: CanvasTone | undefined) {
  return tone ? `canvas-row--${tone}` : undefined
}
