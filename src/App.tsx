import { ActivityLog } from './components/ActivityLog'
import { ArtifactsView } from './components/ArtifactsView'
import { CanvasPanel } from './components/CanvasPanel'
import { Chat } from './components/Chat'
import { DigestView } from './components/DigestView'
import { GoalsBoard } from './components/GoalsBoard'
import { MarketplaceView } from './components/MarketplaceView'
import { PreviewPanel } from './components/PreviewPanel'
import { SettingsView } from './components/SettingsView'
import { Sidebar } from './components/Sidebar'
import { WorkspaceModals } from './components/WorkspaceModals'
import { listingById } from './workspace-data'
import { useWorkspace } from './lib/use-workspace'

export default function App() {
  const workspace = useWorkspace()
  const previewOpen = Boolean(workspace.file || workspace.canvas)

  return (
    <div className={previewOpen ? 'grok-app grok-app--preview' : 'grok-app'}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar
        workspace={workspace.workspace}
        activeId={workspace.conversation.id}
        surface={workspace.surface}
        rooms={workspace.rooms}
        width={workspace.sidebarWidth}
        onWidthChange={workspace.setSidebarWidth}
        onAnnounce={workspace.announce}
        onSelect={(id) => workspace.selectThread(id)}
        onSelectRoom={(threadId, roomId) => workspace.selectThread(threadId, roomId)}
        onWorkspaceChange={workspace.changeWorkspace}
        onOpenSurface={workspace.openSurface}
        onNewThread={() => workspace.setModal({ kind: 'new-thread' })}
        onMarketplace={() => workspace.openSurface({ kind: 'marketplace' })}
        onProfile={() => workspace.openSettings('profile')}
      />
      {workspace.surface.kind === 'chat' ? (
        <Chat
          conversation={workspace.conversation}
          feed={workspace.feed}
          rooms={workspace.threadRooms}
          activeRoom={workspace.activeRoom}
          activeFileId={workspace.artifact?.kind === 'file' ? workspace.artifact.id : null}
          activeCanvasId={workspace.artifact?.kind === 'canvas' ? workspace.artifact.id : null}
          activeGoalId={workspace.surface.kind === 'chat' ? undefined : undefined}
          reactions={workspace.reactions}
          onOpenFile={workspace.openFile}
          onOpenCanvas={workspace.openCanvas}
          onOpenGoal={(goalId) => workspace.openSurface({ kind: 'goals', goalId: goalId || undefined })}
          onSelectRoom={workspace.selectRoom}
          onNewRoom={() => workspace.setModal({ kind: 'new-room' })}
          onRenameRoom={(roomId) => workspace.setModal({ kind: 'rename-room', roomId })}
          onArchiveRoom={workspace.archiveRoom}
          onRestoreRoom={workspace.restoreRoom}
          onShare={() => workspace.setModal({ kind: 'share' })}
          onDesktop={() => workspace.setModal({ kind: 'desktop' })}
          onAddFile={() => workspace.setModal({ kind: 'add-file' })}
          onVoice={() => workspace.setModal({ kind: 'voice' })}
          onSend={(text) => workspace.appendMessage(
            { threadId: workspace.conversation.id, roomId: workspace.activeRoomId ?? undefined },
            text,
          )}
          onReaction={(messageId) => workspace.setModal({ kind: 'reaction', messageId })}
          onReply={() => workspace.setModal({ kind: 'new-room' })}
          onMore={(messageId) => workspace.setModal({ kind: 'more', messageId })}
          onIdentity={() => workspace.setModal({
            kind: 'bot-detail',
            agent: workspace.conversation.kind === 'agent' ? workspace.conversation.agent : 'community',
          })}
          onActivity={() => workspace.openSurface({
            kind: 'activity',
            agent: workspace.conversation.kind === 'agent' ? workspace.conversation.agent : undefined,
          })}
          onChip={(label) => workspace.setModal({ kind: 'chip-ref', label })}
          onExternalLink={(href, title) => workspace.setModal({ kind: 'external-link', href, title })}
        />
      ) : null}
      {workspace.surface.kind === 'goals' ? (
        <GoalsBoard
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          selectedId={workspace.surface.goalId}
          extraGoals={workspace.createdGoals}
          onSelect={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
          onCreate={() => workspace.setModal({ kind: 'new-goal' })}
          onOpenThread={(threadId) => workspace.selectThread(threadId)}
          onOpenCanvas={workspace.openCanvas}
        />
      ) : null}
      {workspace.surface.kind === 'activity' ? (
        <ActivityLog
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          items={workspace.activity}
          agent={workspace.surface.agent}
          onFilterAgent={(agent) => workspace.openSurface({ kind: 'activity', agent })}
          onOpenThread={(threadId) => workspace.selectThread(threadId)}
          onOpenCanvas={workspace.openCanvas}
          onOpenFile={workspace.openFile}
          onOpenGoal={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
          onSetApproval={workspace.setApproval}
        />
      ) : null}
      {workspace.surface.kind === 'digest' ? (
        <DigestView
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          dismissedIds={workspace.dismissedDigestIds}
          onDismiss={workspace.dismissDigest}
          onOpenGoal={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
          onOpenCanvas={workspace.openCanvas}
          onOpenThread={(threadId) => workspace.selectThread(threadId)}
        />
      ) : null}
      {workspace.surface.kind === 'artifacts' ? (
        <ArtifactsView
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          selectedId={workspace.surface.artifactId}
          onSelect={(artifactId) => workspace.openSurface({ kind: 'artifacts', artifactId })}
          onOpenCanvas={workspace.openCanvas}
          onOpenFile={workspace.openFile}
          onOpenGoal={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
        />
      ) : null}
      {workspace.surface.kind === 'marketplace' ? (
        <MarketplaceView
          selectedId={workspace.surface.listingId}
          installedIds={workspace.installedListingIds}
          onSelect={(listingId) => workspace.openSurface({ kind: 'marketplace', listingId })}
          onToggle={workspace.toggleListing}
          onOpenBot={(listing) => {
            const listingMeta = listingById(listing.id) ?? listing
            if (listingMeta.agent) workspace.setModal({ kind: 'bot-detail', agent: listingMeta.agent })
          }}
        />
      ) : null}
      {workspace.surface.kind === 'settings' ? (
        <SettingsView
          section={workspace.surface.section}
          permissions={workspace.permissions}
          onSection={(section) => workspace.openSettings(section)}
          onAutonomy={workspace.updateAutonomy}
          onCapability={workspace.toggleCapability}
          onApproval={workspace.toggleApprovalRequired}
          onOpenActivity={(agent) => workspace.openSurface({ kind: 'activity', agent })}
        />
      ) : null}
      {workspace.file ? (
        <PreviewPanel
          file={workspace.file}
          width={workspace.previewWidth}
          onWidthChange={workspace.setPreviewWidth}
          onClose={workspace.closeArtifact}
        />
      ) : null}
      {workspace.canvas ? (
        <CanvasPanel
          canvas={workspace.canvas}
          width={workspace.previewWidth}
          onWidthChange={workspace.setPreviewWidth}
          onClose={workspace.closeArtifact}
        />
      ) : null}
      <WorkspaceModals workspace={workspace} />
      <div className="sr-only" role="status" aria-atomic="true" aria-live="polite">
        {workspace.liveMessage}
      </div>
    </div>
  )
}
