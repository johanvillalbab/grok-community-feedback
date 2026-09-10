import { useMemo, useRef, useState } from 'react'
import { CanvasPanel } from './components/CanvasPanel'
import { Chat } from './components/Chat'
import { PreviewPanel } from './components/PreviewPanel'
import { Sidebar } from './components/Sidebar'
import { CANVASES, DEFAULT_CONVERSATION_ID, DEFAULT_WORKSPACE_ID, FEEDS, FILES } from './data'
import { defaultCanvasWidth, defaultPreviewWidth, defaultSidebarWidth } from './lib/preview-layout'
import { findThread, firstThread, getWorkspace } from './lib/workspace-nav'
import type { OpenArtifact } from './types'

export default function App() {
  const [workspaceId, setWorkspaceId] = useState(DEFAULT_WORKSPACE_ID)
  const [activeId, setActiveId] = useState(DEFAULT_CONVERSATION_ID)
  const [artifact, setArtifact] = useState<OpenArtifact | null>(null)
  const [previewWidth, setPreviewWidth] = useState(defaultPreviewWidth)
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth)
  const [liveMessage, setLiveMessage] = useState('')
  const openerRef = useRef<HTMLElement | null>(null)

  const workspace = useMemo(() => getWorkspace(workspaceId), [workspaceId])
  const conversation = useMemo(
    () => findThread(workspace, activeId) ?? firstThread(workspace),
    [activeId, workspace],
  )
  const feed = FEEDS[conversation.id] ?? []
  const file = artifact?.kind === 'file' ? FILES[artifact.id] : undefined
  const canvas = artifact?.kind === 'canvas' ? CANVASES[artifact.id] : undefined

  const rememberOpener = () => {
    const active = document.activeElement
    if (active instanceof HTMLElement) openerRef.current = active
  }

  const closeArtifact = () => {
    const panelId = artifact?.kind === 'canvas' ? 'workspace-canvas-panel' : 'file-preview-panel'
    const panel = document.getElementById(panelId)
    const restore = Boolean(panel?.contains(document.activeElement))
    const message = artifact?.kind === 'canvas'
      ? 'Canvas closed'
      : artifact?.kind === 'file'
        ? 'Preview closed'
        : ''
    setArtifact(null)
    if (message) setLiveMessage(message)
    if (restore) {
      const opener = openerRef.current
      queueMicrotask(() => opener?.focus())
    }
  }

  const openFile = (id: string) => {
    rememberOpener()
    if (!artifact) setPreviewWidth(defaultPreviewWidth())
    setArtifact({ kind: 'file', id })
    const next = FILES[id]
    if (next) setLiveMessage(`Preview open: ${next.name}`)
  }

  const openCanvas = (id: string) => {
    if (artifact?.kind === 'canvas' && artifact.id === id) {
      closeArtifact()
      return
    }
    rememberOpener()
    if (!artifact) setPreviewWidth(defaultCanvasWidth())
    setArtifact({ kind: 'canvas', id })
    const next = CANVASES[id]
    if (next) setLiveMessage(`Canvas open: ${next.title}`)
  }

  return (
    <div className={artifact ? 'grok-app grok-app--preview' : 'grok-app'}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar
        workspace={workspace}
        activeId={conversation.id}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
        onAnnounce={setLiveMessage}
        onSelect={(id) => {
          const next = findThread(workspace, id) ?? firstThread(workspace)
          setActiveId(next.id)
          setArtifact(null)
          setLiveMessage(`${next.parentTitle}: ${next.title}`)
        }}
        onWorkspaceChange={(id) => {
          const nextWorkspace = getWorkspace(id)
          const nextThread = findThread(nextWorkspace, activeId) ?? firstThread(nextWorkspace)
          setWorkspaceId(nextWorkspace.id)
          setActiveId(nextThread.id)
          setArtifact(null)
          setLiveMessage(`Workspace: ${nextWorkspace.name}. ${nextThread.parentTitle}: ${nextThread.title}`)
        }}
      />
      <Chat
        conversation={conversation}
        feed={feed}
        activeFileId={artifact?.kind === 'file' ? artifact.id : null}
        activeCanvasId={artifact?.kind === 'canvas' ? artifact.id : null}
        onOpenFile={openFile}
        onOpenCanvas={openCanvas}
      />
      {file ? (
        <PreviewPanel
          file={file}
          width={previewWidth}
          onWidthChange={setPreviewWidth}
          onClose={closeArtifact}
        />
      ) : null}
      {canvas ? (
        <CanvasPanel
          canvas={canvas}
          width={previewWidth}
          onWidthChange={setPreviewWidth}
          onClose={closeArtifact}
        />
      ) : null}
      <div className="sr-only" role="status" aria-atomic="true" aria-live="polite">
        {liveMessage}
      </div>
    </div>
  )
}
