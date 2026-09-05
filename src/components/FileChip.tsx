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
  const openFile = file && onOpen ? onOpen : undefined

  const className = [
    'file-chip',
    active ? 'file-chip--active' : '',
    openFile ? 'file-chip--interactive' : '',
  ].join(' ')

  if (!openFile || !file) {
    return <span className={className}>{label}</span>
  }

  return (
    <span
      className={className}
      role="button"
      tabIndex={0}
      aria-expanded={active}
      aria-controls="file-preview-panel"
      onClick={() => openFile(file.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openFile(file.id)
        }
      }}
    >
      {label}
    </span>
  )
}
