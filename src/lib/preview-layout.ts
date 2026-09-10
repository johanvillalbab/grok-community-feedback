const APP_SCALE = 1.3
const CHAT_MIN = 340
const PREVIEW_MIN = 280
export const BOT_FACE = 32
export const SIDEBAR_EXPANDED = 256
export const SIDEBAR_COLLAPSED = 56
export const SIDEBAR_SNAP = 140
export const SIDEBAR_MAX = 300
const SIDEBAR_WIDTH = SIDEBAR_EXPANDED

export function defaultPreviewWidth() {
  const layoutWidth = window.innerWidth / APP_SCALE
  return clampPreviewWidth(
    Math.min(440, layoutWidth * 0.42),
    layoutWidth,
    SIDEBAR_WIDTH,
  )
}

export function defaultCanvasWidth() {
  const layoutWidth = window.innerWidth / APP_SCALE
  return clampPreviewWidth(
    Math.min(560, layoutWidth * 0.52),
    layoutWidth,
    SIDEBAR_WIDTH,
  )
}

export function maxPreviewWidth(appWidth: number, sidebarWidth: number) {
  return Math.max(PREVIEW_MIN, appWidth - sidebarWidth - CHAT_MIN)
}

export function clampPreviewWidth(
  width: number,
  appWidth: number,
  sidebarWidth: number,
) {
  return Math.round(Math.min(maxPreviewWidth(appWidth, sidebarWidth), Math.max(PREVIEW_MIN, width)))
}

export const PREVIEW_MIN_WIDTH = PREVIEW_MIN

export function defaultSidebarWidth() {
  const layoutWidth = window.innerWidth / APP_SCALE
  return layoutWidth < 660 ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED
}

export function isSidebarCollapsed(width: number) {
  return width < SIDEBAR_SNAP
}

export function maxSidebarWidth(appWidth: number, previewWidth: number) {
  return Math.max(SIDEBAR_COLLAPSED, appWidth - CHAT_MIN - previewWidth)
}

export function clampSidebarWidth(
  width: number,
  appWidth: number,
  previewWidth: number,
) {
  return Math.round(Math.min(
    maxSidebarWidth(appWidth, previewWidth),
    Math.max(SIDEBAR_COLLAPSED, Math.min(SIDEBAR_MAX, width)),
  ))
}

export function snapSidebarWidth(width: number) {
  return width < SIDEBAR_SNAP ? SIDEBAR_COLLAPSED : Math.max(width, SIDEBAR_EXPANDED)
}
