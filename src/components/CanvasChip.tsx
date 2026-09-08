import { CANVASES } from '../data'
import { CanvasIcon } from './Icons'

type CanvasChipProps = {
  canvasId: string
  text?: string
  active?: boolean
  onOpen: (canvasId: string) => void
}

export function CanvasChip({ canvasId, text, active = false, onOpen }: CanvasChipProps) {
  const canvas = CANVASES[canvasId]
  const label = text ?? canvas?.title ?? canvasId

  return (
    <span
      className={['file-chip', 'file-chip--interactive', 'canvas-chip', active ? 'file-chip--active' : ''].join(' ')}
      role="button"
      tabIndex={0}
      aria-expanded={active}
      aria-controls={active ? 'workspace-canvas-panel' : undefined}
      onClick={() => onOpen(canvasId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(canvasId)
        }
      }}
    >
      <CanvasIcon />
      {label}
    </span>
  )
}
