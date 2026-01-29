export const __FOCUS_GRAPH_DEBUG__ =
  String(import.meta.env?.VITE_FOCUS_GRAPH_DEBUG__ ?? '').toLowerCase() === 'true'

export { FocusGraph } from './graph'
export {
  FocusDebugOverlay,
  FocusGraphInspector,
  FocusProvider,
  FocusZone, getAccessibleName, useFocusController,
  useFocusGraph,
  useFocusNode,
  useFocusZone, useReducedMotion, type FocusDebugOverlayProps,
  type FocusGraphInspectorProps,
  type UseFocusNodeOptions
} from './react'
export type { InitialFocusStrategy, KeyBindings, Verbosity } from './react'
export type { Direction, FocusEdge, FocusNode, FocusNodeMetadata, ResolveOptions } from './types'

