import { useMemo, useState } from 'react'
import { Chat } from './components/Chat'
import { PreviewPanel } from './components/PreviewPanel'
import { Sidebar } from './components/Sidebar'
import { CONVERSATIONS, DEFAULT_CONVERSATION_ID, FEEDS, FILES } from './data'
import { defaultPreviewWidth } from './lib/preview-layout'

export default function App() {
  const [activeId, setActiveId] = useState(DEFAULT_CONVERSATION_ID)
  const [fileId, setFileId] = useState<string | null>(null)
  const [previewWidth, setPreviewWidth] = useState(defaultPreviewWidth)

  const conversation = useMemo(
    () => CONVERSATIONS.find((item) => item.id === activeId) ?? CONVERSATIONS[0],
    [activeId],
  )
  const feed = FEEDS[conversation.id] ?? []
  const file = fileId ? FILES[fileId] : undefined

  return (
    <div className={file ? 'grok-app grok-app--preview' : 'grok-app'}>
      <Sidebar
        conversations={CONVERSATIONS}
        activeId={conversation.id}
        onSelect={(id) => {
          setActiveId(id)
          setFileId(null)
        }}
      />
      <Chat
        conversation={conversation}
        feed={feed}
        activeFileId={fileId}
        onOpenFile={(id) => setFileId(id)}
      />
      {file ? (
        <PreviewPanel
          file={file}
          width={previewWidth}
          onWidthChange={setPreviewWidth}
          onClose={() => setFileId(null)}
        />
      ) : null}
      <div className="sr-only" aria-live="polite">
        {file ? `Preview open: ${file.name}` : ''}
      </div>
    </div>
  )
}
