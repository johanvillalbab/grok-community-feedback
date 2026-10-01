import { FILES } from '../data'

type FileChipProps = {
  fileId?: string
  text?: string
  active?: boolean
  onOpen?: (fileId: string) => void
}

export function FileChip({ fileId, text, active = false, onOpen }: FileChipProps) {
  const file = fileId ? FILES[fileId] : undefined
  const label = file ? (text ?? file.path) : (text ?? '')
  const interactive = Boolean(onOpen)

  const className = [
    'file-chip',
    active ? 'file-chip--active' : '',
    interactive ? 'file-chip--interactive' : '',
  ].join(' ')

  const activate = () => {
    if (!onOpen) return
    onOpen(file?.id ?? label)
  }

  if (!interactive) {
    return <span className={className}>{label}</span>
  }

  return (
    <span
      className={className}
      role="button"
      tabIndex={0}
      aria-expanded={active}
      aria-controls={active && file ? 'file-preview-panel' : undefined}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          activate()
        }
      }}
    >
      {label}
    </span>
  )
}
