export function getAccessibleName(el: HTMLElement): string {
  const label = el.getAttribute('aria-label')
  if (label?.trim()) return label.trim()

  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    const root = el.getRootNode() as Document
    const firstId = labelledBy.split(/\s+/)[0]
    const labelEl = root.getElementById?.(firstId)
    if (labelEl?.textContent?.trim()) return labelEl.textContent.trim()
  }

  const text = el.textContent?.trim()
  if (text) return text

  return ''
}
