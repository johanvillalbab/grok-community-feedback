const APP_SCALE = 1.2
const CHAT_MIN = 340
const PREVIEW_MIN = 280
const SIDEBAR_WIDTH = 203

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
