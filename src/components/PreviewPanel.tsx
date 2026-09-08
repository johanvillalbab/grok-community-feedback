import { useEffect } from 'react'
import Markdown from 'react-markdown'
import type { WorkspaceFile } from '../types'
import { isEditableTarget } from '../lib/keyboard'
import { useSidePanel } from '../lib/use-side-panel'
import { CloseIcon, FileIcon } from './Icons'

type PreviewPanelProps = {
  file: WorkspaceFile
  width: number
  onWidthChange: (width: number) => void
  onClose: () => void
}

export function PreviewPanel({ file, width, onWidthChange, onClose }: PreviewPanelProps) {
  const { panelRef, resizerProps } = useSidePanel(onWidthChange)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isEditableTarget(event.target)) return
      event.preventDefault()
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

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
        aria-label="Resize preview"
        aria-valuenow={width}
        {...resizerProps}
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
