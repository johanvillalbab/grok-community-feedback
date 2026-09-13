import { useEffect, type ReactNode } from 'react'
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
import { SIDEBAR_EXPANDED } from './lib/preview-layout'
import { usePhoneLayout } from './lib/viewport'
import { useWorkspace } from './lib/use-workspace'

export default function App() {
  const workspace = useWorkspace()
  const phone = usePhoneLayout()
  const previewOpen = Boolean(workspace.file || workspace.canvas)
  const sheetOpen = workspace.surface.kind !== 'chat'
  const { navOpen, closeNav, setSidebarWidth } = workspace

  useEffect(() => {
    document.body.classList.toggle('is-phone', phone)
    document.body.classList.toggle('nav-lock', phone && navOpen)
    return () => {
      document.body.classList.remove('nav-lock')
    }
  }, [phone, navOpen])

  useEffect(() => {
    if (phone) return
    setSidebarWidth(SIDEBAR_EXPANDED)
  }, [phone, setSidebarWidth])

  useEffect(() => {
    if (!phone || !navOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeNav()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phone, closeNav, navOpen])

  const appClass = [
    'grok-app',
    previewOpen ? 'grok-app--preview' : '',
    phone ? 'grok-app--phone' : '',
    phone && navOpen ? 'grok-app--nav-open' : '',
    phone && sheetOpen ? 'grok-app--sheet' : '',
    phone && previewOpen ? 'grok-app--preview-sheet' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={appClass}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div className="sr-only" role="status" aria-atomic="true" aria-live="polite">
        {workspace.liveMessage}
      </div>
      {phone && navOpen ? (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Close workspace menu"
          onClick={closeNav}
        />
      ) : null}
      <Sidebar
        workspace={workspace.workspace}
        activeId={workspace.conversation.id}
        activeRoomId={workspace.activeRoomId}
        surface={workspace.surface}
        rooms={workspace.rooms}
        width={workspace.sidebarWidth}
        drawer={phone}
        open={!phone || navOpen}
        onWidthChange={workspace.setSidebarWidth}
        onAnnounce={workspace.announce}
        onClose={closeNav}
        onSelect={(id) => workspace.selectThread(id)}
        onSelectRoom={(threadId, roomId) => workspace.selectThread(threadId, roomId)}
        onWorkspaceChange={workspace.changeWorkspace}
        onOpenSurface={workspace.openSurface}
        onCompose={() => {
          closeNav()
          workspace.setModal({ kind: 'compose' })
        }}
        onMarketplace={() => workspace.openSurface({ kind: 'marketplace' })}
        onProfile={() => workspace.openSettings('profile')}
      />
      {workspace.surface.kind === 'chat' || phone ? (
        <Chat
          main={workspace.surface.kind === 'chat'}
          conversation={workspace.conversation}
          feed={workspace.feed}
          rooms={workspace.threadRooms}
          activeRoom={workspace.activeRoom}
          activeFileId={workspace.artifact?.kind === 'file' ? workspace.artifact.id : null}
          activeCanvasId={workspace.artifact?.kind === 'canvas' ? workspace.artifact.id : null}
          activeGoalId={workspace.activeGoalId}
          reactions={workspace.reactions}
          navOpen={phone && navOpen}
          onOpenNav={phone ? workspace.toggleNav : undefined}
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
        <SurfaceFrame phone={phone}>
        <GoalsBoard
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          selectedId={workspace.surface.goalId}
          extraGoals={workspace.createdGoals}
          onOpenNav={phone ? workspace.toggleNav : undefined}
          onBack={phone ? () => workspace.openSurface({ kind: 'chat' }) : undefined}
          onSelect={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
          onCreate={() => workspace.setModal({ kind: 'new-goal' })}
          onOpenThread={(threadId) => workspace.selectThread(threadId)}
          onOpenCanvas={workspace.openCanvas}
        />
        </SurfaceFrame>
      ) : null}
      {workspace.surface.kind === 'activity' ? (
        <SurfaceFrame phone={phone}>
        <ActivityLog
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          items={workspace.activity}
          agent={workspace.surface.agent}
          onOpenNav={phone ? workspace.toggleNav : undefined}
          onBack={phone ? () => workspace.openSurface({ kind: 'chat' }) : undefined}
          onFilterAgent={(agent) => workspace.openSurface({ kind: 'activity', agent })}
          onOpenThread={(threadId) => workspace.selectThread(threadId)}
          onOpenCanvas={workspace.openCanvas}
          onOpenFile={workspace.openFile}
          onOpenGoal={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
          onSetApproval={workspace.setApproval}
          onOpenGoals={() => workspace.openSurface({ kind: 'goals' })}
          onOpenSettings={() => workspace.openSettings('autonomy')}
          onOpenDigest={() => workspace.openSurface({ kind: 'digest' })}
        />
        </SurfaceFrame>
      ) : null}
      {workspace.surface.kind === 'digest' ? (
        <SurfaceFrame phone={phone}>
        <DigestView
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          dismissedIds={workspace.dismissedDigestIds}
          onOpenNav={phone ? workspace.toggleNav : undefined}
          onBack={phone ? () => workspace.openSurface({ kind: 'chat' }) : undefined}
          onDismiss={workspace.dismissDigest}
          onOpenGoal={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
          onOpenCanvas={workspace.openCanvas}
          onOpenThread={(threadId) => workspace.selectThread(threadId)}
        />
        </SurfaceFrame>
      ) : null}
      {workspace.surface.kind === 'artifacts' ? (
        <SurfaceFrame phone={phone}>
        <ArtifactsView
          workspaceId={workspace.workspace.id}
          workspaceName={workspace.workspace.name}
          selectedId={workspace.surface.artifactId}
          onOpenNav={phone ? workspace.toggleNav : undefined}
          onBack={phone ? () => workspace.openSurface({ kind: 'chat' }) : undefined}
          onSelect={(artifactId) => workspace.openSurface({ kind: 'artifacts', artifactId })}
          onOpenCanvas={workspace.openCanvas}
          onOpenFile={workspace.openFile}
          onOpenGoal={(goalId) => workspace.openSurface({ kind: 'goals', goalId })}
          onOpenAtlas={workspace.openAtlasThread}
        />
        </SurfaceFrame>
      ) : null}
      {workspace.surface.kind === 'marketplace' ? (
        <SurfaceFrame phone={phone}>
        <MarketplaceView
          selectedId={workspace.surface.listingId}
          installedIds={workspace.installedListingIds}
          onOpenNav={phone ? workspace.toggleNav : undefined}
          onBack={phone ? () => workspace.openSurface({ kind: 'chat' }) : undefined}
          onSelect={(listingId) => workspace.openSurface({ kind: 'marketplace', listingId })}
          onToggle={workspace.toggleListing}
          onOpenBot={(listing) => {
            const listingMeta = listingById(listing.id) ?? listing
            if (listingMeta.agent) workspace.setModal({ kind: 'bot-detail', agent: listingMeta.agent })
          }}
        />
        </SurfaceFrame>
      ) : null}
      {workspace.surface.kind === 'settings' ? (
        <SurfaceFrame phone={phone}>
        <SettingsView
          section={workspace.surface.section}
          permissions={workspace.permissions}
          notifyGlobal={workspace.notifyGlobal}
          onOpenNav={phone ? workspace.toggleNav : undefined}
          onBack={phone ? () => workspace.openSurface({ kind: 'chat' }) : undefined}
          onSection={(section) => workspace.openSettings(section)}
          onAutonomy={workspace.updateAutonomy}
          onCapability={workspace.toggleCapability}
          onApproval={workspace.toggleApprovalRequired}
          onNotifyGlobal={workspace.setNotifyGlobal}
          onOpenActivity={(agent) => workspace.openSurface({ kind: 'activity', agent })}
        />
        </SurfaceFrame>
      ) : null}
      {workspace.file ? (
        <PreviewPanel
          file={workspace.file}
          width={workspace.previewWidth}
          sheet={phone}
          onWidthChange={workspace.setPreviewWidth}
          onClose={workspace.closeArtifact}
        />
      ) : null}
      {workspace.canvas ? (
        <CanvasPanel
          canvas={workspace.canvas}
          width={workspace.previewWidth}
          sheet={phone}
          onWidthChange={workspace.setPreviewWidth}
          onClose={workspace.closeArtifact}
        />
      ) : null}
      <WorkspaceModals workspace={workspace} phone={phone} />
    </div>
  )
}

function SurfaceFrame({ phone, children }: { phone: boolean; children: ReactNode }) {
  if (!phone) return children
  return <div className="surface-sheet">{children}</div>
}
