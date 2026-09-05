import { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import type { WorkspaceFile } from '../types'
import { clampPreviewWidth, PREVIEW_MIN_WIDTH } from '../lib/preview-layout'
import { CloseIcon, FileIcon } from './Icons'

type PreviewPanelProps = {
  file: WorkspaceFile
  width: number
  onWidthChange: (width: number) => void
  onClose: () => void
}

export function PreviewPanel({ file, width, onWidthChange, onClose }: PreviewPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const onWindowResize = () => {
      const panel = panelRef.current
      const app = panel?.parentElement
      if (!panel || !app) return
      const sidebar = app.querySelector('.grok-sidebar')
      const sidebarWidth = sidebar instanceof HTMLElement ? sidebar.offsetWidth : 203
      onWidthChange(clampPreviewWidth(panel.offsetWidth, app.clientWidth, sidebarWidth))
    }

    window.addEventListener('resize', onWindowResize)
    return () => window.removeEventListener('resize', onWindowResize)
  }, [onWidthChange])

  return (
    <aside
      ref={panelRef}
      id="file-preview-panel"
      aria-labelledby="file-preview-title"
      className="preview-panel"
      style={{ width, flexBasis: width }}
    >
      <div
        className="preview-panel__resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize preview"
        aria-valuenow={width}
        aria-valuemin={PREVIEW_MIN_WIDTH}
        tabIndex={0}
        onPointerDown={(event) => {
          const panel = panelRef.current
          if (!panel) return
          dragRef.current = { startX: event.clientX, startWidth: panel.offsetWidth }
          event.currentTarget.setPointerCapture(event.pointerId)
          document.body.classList.add('is-resizing')
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          const panel = panelRef.current
          const app = panel?.parentElement
          if (!drag || !panel || !app) return
          const scale = panel.getBoundingClientRect().width / panel.offsetWidth
          const sidebar = app.querySelector('.grok-sidebar')
          const sidebarWidth = sidebar instanceof HTMLElement ? sidebar.offsetWidth : 203
          const next = drag.startWidth - (event.clientX - drag.startX) / scale
          onWidthChange(clampPreviewWidth(next, app.clientWidth, sidebarWidth))
        }}
        onPointerUp={(event) => {
          dragRef.current = null
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
          document.body.classList.remove('is-resizing')
        }}
        onPointerCancel={() => {
          dragRef.current = null
          document.body.classList.remove('is-resizing')
        }}
        onDoubleClick={() => {
          const panel = panelRef.current
          const app = panel?.parentElement
          if (!app) return
          const sidebar = app.querySelector('.grok-sidebar')
          const sidebarWidth = sidebar instanceof HTMLElement ? sidebar.offsetWidth : 203
          onWidthChange(clampPreviewWidth(Math.min(440, app.clientWidth * 0.42), app.clientWidth, sidebarWidth))
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          const panel = panelRef.current
          const app = panel?.parentElement
          if (!panel || !app) return
          const sidebar = app.querySelector('.grok-sidebar')
          const sidebarWidth = sidebar instanceof HTMLElement ? sidebar.offsetWidth : 203
          const delta = event.key === 'ArrowLeft' ? 16 : -16
          onWidthChange(clampPreviewWidth(panel.offsetWidth + delta, app.clientWidth, sidebarWidth))
        }}
      />
      <header className="preview-panel__header">
        <div className="preview-panel__heading">
          <p>
            <FileIcon />
            <span id="file-preview-title">
              {file.name}
            </span>
          </p>
          <p>{file.path}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="preview-panel__close"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="preview-panel__content">
        {file.language === 'markdown' ? (
          <div className="preview-md">
            <Markdown>{file.content}</Markdown>
          </div>
        ) : (
          <pre>
            {file.content}
          </pre>
        )}
      </div>
    </aside>
  )
}
