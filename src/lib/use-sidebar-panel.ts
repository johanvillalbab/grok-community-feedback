import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  clampSidebarWidth,
  isSidebarCollapsed,
  maxSidebarWidth,
  SIDEBAR_COLLAPSED,
  SIDEBAR_EXPANDED,
  SIDEBAR_SNAP,
  snapSidebarWidth,
} from './preview-layout'

type DragState = {
  startX: number
  startWidth: number
}

type SidebarPanelOptions = {
  onWidthChange: (width: number) => void
  onAnnounce?: (message: string) => void
}

export function useSidebarPanel({ onWidthChange, onAnnounce }: SidebarPanelOptions) {
  const panelRef = useRef<HTMLElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const lastExpandedRef = useRef(SIDEBAR_EXPANDED)
  const [valueMax, setValueMax] = useState(SIDEBAR_EXPANDED)

  useEffect(() => {
    const syncBounds = () => {
      const panel = panelRef.current
      const app = panel?.parentElement
      if (!panel || !app) return
      const previewWidth = readPreviewWidth(app)
      const next = clampSidebarWidth(panel.offsetWidth, app.clientWidth, previewWidth)
      setValueMax(maxSidebarWidth(app.clientWidth, previewWidth))
      if (isSidebarCollapsed(next)) moveFocusFromHiddenSearch(panel)
      onWidthChange(next)
    }

    const app = panelRef.current?.parentElement
    const preview = app?.querySelector('.preview-panel')
    const observer = new ResizeObserver(syncBounds)
    if (app) observer.observe(app)
    if (preview instanceof HTMLElement) observer.observe(preview)

    syncBounds()
    window.addEventListener('resize', syncBounds)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncBounds)
    }
  }, [onWidthChange])

  const applyWidth = (next: number, announce = false) => {
    const panel = panelRef.current
    const app = panel?.parentElement
    if (!panel || !app) return
    const clamped = clampSidebarWidth(next, app.clientWidth, readPreviewWidth(app))
    const wasCollapsed = isSidebarCollapsed(panel.offsetWidth)
    const nowCollapsed = isSidebarCollapsed(clamped)
    if (!nowCollapsed) lastExpandedRef.current = clamped
    if (nowCollapsed) moveFocusFromHiddenSearch(panel)
    onWidthChange(clamped)
    if (!announce || wasCollapsed === nowCollapsed) return
    onAnnounce?.(nowCollapsed ? 'Conversations collapsed' : 'Conversations expanded')
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current
    if (!panel) return
    dragRef.current = { startX: event.clientX, startWidth: panel.offsetWidth }
    event.currentTarget.setPointerCapture(event.pointerId)
    document.body.classList.add('is-resizing')
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const panel = panelRef.current
    if (!drag || !panel) return
    const scale = panel.getBoundingClientRect().width / panel.offsetWidth
    applyWidth(drag.startWidth + (event.clientX - drag.startX) / scale)
  }

  const endDrag = (event?: PointerEvent<HTMLDivElement>) => {
    const panel = panelRef.current
    if (panel) applyWidth(snapSidebarWidth(panel.offsetWidth), true)
    dragRef.current = null
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    document.body.classList.remove('is-resizing')
  }

  const onDoubleClick = () => {
    const panel = panelRef.current
    if (!panel) return
    applyWidth(isSidebarCollapsed(panel.offsetWidth) ? lastExpandedRef.current : SIDEBAR_COLLAPSED, true)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const panel = panelRef.current
    if (!panel) return
    if (event.key === 'ArrowRight' && panel.offsetWidth <= SIDEBAR_SNAP) {
      applyWidth(lastExpandedRef.current, true)
      return
    }
    if (event.key === 'ArrowLeft' && panel.offsetWidth <= SIDEBAR_SNAP) {
      applyWidth(SIDEBAR_COLLAPSED, true)
      return
    }
    const next = panel.offsetWidth + (event.key === 'ArrowRight' ? 16 : -16)
    applyWidth(next < SIDEBAR_SNAP ? SIDEBAR_COLLAPSED : next, true)
  }

  return {
    panelRef,
    resizerProps: {
      role: 'separator' as const,
      'aria-orientation': 'vertical' as const,
      'aria-valuemin': SIDEBAR_COLLAPSED,
      'aria-valuemax': valueMax,
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: () => endDrag(),
      onDoubleClick,
      onKeyDown,
    },
  }
}

function readPreviewWidth(app: HTMLElement) {
  const preview = app.querySelector('.preview-panel')
  return preview instanceof HTMLElement ? preview.offsetWidth : 0
}

export function moveFocusFromHiddenSearch(panel: HTMLElement) {
  const search = panel.querySelector('.sidebar-search')
  const active = document.activeElement
  if (!(active instanceof HTMLElement) || !search?.contains(active)) return
  panel.querySelector<HTMLButtonElement>('.sidebar-plus')?.focus()
}
