const VALID_DIRECTIONS = new Set(['up', 'down', 'left', 'right', 'next', 'prev'])

function isDev(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
}

export function warnTrapFocusWithoutZoneId(): void {
  if (!isDev()) return
  console.warn(
    '[focus-graph] FocusZone has trapFocus={true} but no zoneId. Trap focus requires a zoneId.'
  )
}

export function warnInitialFocusNodeNotFound(nodeId: string): void {
  if (!isDev()) return
  console.warn(
    `[focus-graph] initialFocus="${nodeId}" but no node with that id is registered.`
  )
}

export function warnInvalidKeyBindings(keyBindings: Record<string, unknown>): void {
  if (!isDev()) return
  for (const [key, value] of Object.entries(keyBindings)) {
    if (value != null && !VALID_DIRECTIONS.has(value as string)) {
      console.warn(
        `[focus-graph] keyBindings["${key}"]="${value}" is not a valid direction. Use: up, down, left, right, next, prev.`
      )
    }
  }
}
