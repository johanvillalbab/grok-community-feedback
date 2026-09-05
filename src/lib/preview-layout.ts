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

export function clampPreviewWidth(
  width: number,
  appWidth: number,
  sidebarWidth: number,
) {
  const max = Math.max(PREVIEW_MIN, appWidth - sidebarWidth - CHAT_MIN)
  return Math.round(Math.min(max, Math.max(PREVIEW_MIN, width)))
}

export const PREVIEW_MIN_WIDTH = PREVIEW_MIN
