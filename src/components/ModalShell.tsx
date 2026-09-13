import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './Icons'

type ModalShellProps = {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function ModalShell({ title, subtitle, onClose, children, footer }: ModalShellProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [onClose])

  return (
    <div className="ws-modal-root">
      <button type="button" className="ws-modal-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div
        ref={dialogRef}
        className="ws-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ws-modal-title"
        tabIndex={-1}
      >
        <header className="ws-modal__header">
          <div>
            <h2 id="ws-modal-title">{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="preview-panel__close" aria-label="Close dialog" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        <div className="ws-modal__body">{children}</div>
        {footer ? <footer className="ws-modal__footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
