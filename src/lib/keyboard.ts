export function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}
