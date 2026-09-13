import type { ArtifactRecord } from '../types'
import { artifactsForWorkspace } from '../workspace-data'
import { LayersIcon } from './Icons'
import { WorkspaceScreen } from './WorkspaceScreen'

type ArtifactsViewProps = {
  workspaceId: string
  workspaceName: string
  selectedId?: string
  onSelect: (id: string) => void
  onOpenCanvas: (canvasId: string) => void
  onOpenFile: (fileId: string) => void
  onOpenGoal: (goalId: string) => void
}

export function ArtifactsView({
  workspaceId,
  workspaceName,
  selectedId,
  onSelect,
  onOpenCanvas,
  onOpenFile,
  onOpenGoal,
}: ArtifactsViewProps) {
  const items = artifactsForWorkspace(workspaceId)
  const selected = items.find((item) => item.id === selectedId) ?? items[0]

  return (
    <WorkspaceScreen
      title="Artifacts"
      parent={`${workspaceName} · canvases, files, briefs`}
      icon={<LayersIcon />}
    >
      {items.length === 0 ? (
        <div className="workspace-empty">
          <h2>No sample artifacts here</h2>
          <p>Atlas holds the About canvases and files. Other workspaces keep their work in threads.</p>
        </div>
      ) : (
        <div className="artifact-layout">
          <ul className="artifact-list" aria-label="Artifacts">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={item.id === selected?.id ? 'artifact-row artifact-row--active' : 'artifact-row'}
                  onClick={() => {
                    onSelect(item.id)
                    if (item.canvasId) onOpenCanvas(item.canvasId)
                    if (item.fileId) onOpenFile(item.fileId)
                  }}
                >
                  <span className="artifact-row__kind">{kindLabel(item.kind)}</span>
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </button>
              </li>
            ))}
          </ul>
          {selected ? (
            <article className="artifact-detail">
              <p className="goal-detail__kicker">{kindLabel(selected.kind)}</p>
              <h2>{selected.title}</h2>
              <p>{selected.summary}</p>
              <p className="artifact-detail__source">{selected.source}</p>
              <div className="goal-detail__actions">
                {selected.canvasId ? (
                  <button type="button" className="ws-button" onClick={() => onOpenCanvas(selected.canvasId!)}>Open in rail</button>
                ) : null}
                {selected.fileId ? (
                  <button type="button" className="ws-button" onClick={() => onOpenFile(selected.fileId!)}>Open file</button>
                ) : null}
                {selected.goalId ? (
                  <button type="button" className="ws-button ws-button--ghost" onClick={() => onOpenGoal(selected.goalId!)}>Related goal</button>
                ) : null}
              </div>
            </article>
          ) : null}
        </div>
      )}
    </WorkspaceScreen>
  )
}

function kindLabel(kind: ArtifactRecord['kind']) {
  switch (kind) {
    case 'canvas':
      return 'Canvas'
    case 'file':
      return 'File'
    case 'brief':
      return 'Brief'
    default: {
      const exhaustive: never = kind
      return exhaustive
    }
  }
}
