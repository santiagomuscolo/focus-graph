const _meta =
  typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: { VITE_FOCUS_GRAPH_DEBUG__?: string } })
    : undefined
const _debugEnv = _meta?.env?.VITE_FOCUS_GRAPH_DEBUG__
export const __FOCUS_GRAPH_DEBUG__ = String(_debugEnv ?? '').toLowerCase() === 'true'

export { FocusGraph } from './graph'
export {
  FocusDebugOverlay,
  FocusGraphInspector,
  FocusProvider,
  FocusZone,
  getAccessibleName,
  useFocusController,
  useFocusGraph,
  useFocusNode,
  useFocusZone,
  useReducedMotion,
  type FocusDebugOverlayProps,
  type FocusGraphInspectorProps,
  type UseFocusNodeOptions,
} from './react'
export type { InitialFocusStrategy, KeyBindings, Verbosity } from './react'
export type {
  Direction,
  FocusEdge,
  FocusNode,
  FocusNodeMetadata,
  ResolveOptions,
} from './types'
