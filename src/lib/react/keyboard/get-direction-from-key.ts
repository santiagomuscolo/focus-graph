import type { Direction } from '../../types'
import type { KeyBindings } from '../types'
import { DEFAULT_KEY_BINDINGS } from './default-key-bindings'

export function getDirectionFromKey(
  event: KeyboardEvent,
  keyBindings?: KeyBindings
): Direction | null {
  const key = event.shiftKey && event.key === 'Tab' ? 'Shift+Tab' : event.key
  const bindings = { ...DEFAULT_KEY_BINDINGS, ...keyBindings }
  const direction = bindings[key] ?? null
  return direction
}
