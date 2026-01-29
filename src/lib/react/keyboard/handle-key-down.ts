import type { FocusGraph } from '../../graph'
import type { ResolveOptions } from '../../types'
import type { KeyBindings } from '../types'
import { ESCAPE_KEY } from './default-key-bindings'
import { getDirectionFromKey } from './get-direction-from-key'

export interface HandleKeyDownParams {
  event: KeyboardEvent
  graph: FocusGraph
  keyBindings?: KeyBindings
  onEscape?: () => void
  focusNode: (id: string) => void
  setLastFocusedNodeId: (id: string | null) => void
  resolveOptions?: ResolveOptions
}

export function handleKeyDown(params: HandleKeyDownParams): boolean {
  const {
    event,
    graph,
    keyBindings,
    onEscape,
    focusNode,
    setLastFocusedNodeId,
    resolveOptions = { loop: true },
  } = params

  if (event.key === ESCAPE_KEY) {
    const target = event.target as HTMLElement | null
    if (target != null && graph.getNodeIdByElement(target) != null) {
      if (onEscape) {
        onEscape()
      } else {
        target.blur()
      }
      return true
    }
    return false
  }

  const direction = getDirectionFromKey(event, keyBindings)
  if (direction == null) return false

  const target = event.target as HTMLElement | null
  if (target == null) return false

  const fromId = graph.getNodeIdByElement(target)
  if (fromId == null) return false

  const nextId = graph.resolve(fromId, direction, resolveOptions)
  if (nextId == null) return false

  focusNode(nextId)
  setLastFocusedNodeId(nextId)
  return true
}
