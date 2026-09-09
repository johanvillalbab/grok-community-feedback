import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react'
import { clampPreviewWidth, maxPreviewWidth, PREVIEW_MIN_WIDTH, SIDEBAR_EXPANDED } from './preview-layout'

type DragState = {
  startX: number
  startWidth: number
}

export function useSidePanel(onWidthChange: (width: number) => void) {
  const panelRef = useRef<HTMLElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const [valueMax, setValueMax] = useState(PREVIEW_MIN_WIDTH)

  useEffect(() => {
    const syncBounds = () => {
      const panel = panelRef.current
      const app = panel?.parentElement
      if (!panel || !app) return
      const sidebarWidth = readSidebarWidth(app)
      setValueMax(maxPreviewWidth(app.clientWidth, sidebarWidth))
      onWidthChange(clampPreviewWidth(panel.offsetWidth, app.clientWidth, sidebarWidth))
    }

    const app = panelRef.current?.parentElement
    const sidebar = app?.querySelector('.grok-sidebar')
    const observer = new ResizeObserver(syncBounds)
    if (app) observer.observe(app)
    if (sidebar instanceof HTMLElement) observer.observe(sidebar)

    syncBounds()
    window.addEventListener('resize', syncBounds)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncBounds)
    }
  }, [onWidthChange])

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
    const app = panel?.parentElement
    if (!drag || !panel || !app) return
    const scale = panel.getBoundingClientRect().width / panel.offsetWidth
    const next = drag.startWidth - (event.clientX - drag.startX) / scale
    onWidthChange(clampPreviewWidth(next, app.clientWidth, readSidebarWidth(app)))
  }

  const endDrag = (event?: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    document.body.classList.remove('is-resizing')
  }

  const onDoubleClick = () => {
    const panel = panelRef.current
    const app = panel?.parentElement
    if (!app) return
    onWidthChange(clampPreviewWidth(Math.min(520, app.clientWidth * 0.48), app.clientWidth, readSidebarWidth(app)))
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const panel = panelRef.current
    const app = panel?.parentElement
    if (!panel || !app) return
    const delta = event.key === 'ArrowLeft' ? 16 : -16
    onWidthChange(clampPreviewWidth(panel.offsetWidth + delta, app.clientWidth, readSidebarWidth(app)))
  }

  return {
    panelRef,
    resizerProps: {
      role: 'separator' as const,
      'aria-orientation': 'vertical' as const,
      'aria-valuemin': PREVIEW_MIN_WIDTH,
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

function readSidebarWidth(app: HTMLElement) {
  const sidebar = app.querySelector('.grok-sidebar')
  return sidebar instanceof HTMLElement ? sidebar.offsetWidth : SIDEBAR_EXPANDED
}
