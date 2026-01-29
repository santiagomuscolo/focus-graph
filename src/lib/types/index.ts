/**
 * Direction for focus navigation (spatial + tab-like).
 */
export type Direction = 'up' | 'down' | 'left' | 'right' | 'next' | 'prev'

/**
 * Metadata for a focus node (accessibility and behavior).
 */
export type FocusNodeMetadata = {
  disabled?: boolean
  priority?: number
  role?: string
}

/**
 * A focusable node in the graph: id, optional element ref, metadata, optional zone.
 * elementRef is typed as unknown so the core stays framework-agnostic;
 * consumers can cast to HTMLElement when using with DOM.
 */
export type FocusNode<TRef = unknown> = {
  id: string
  elementRef?: TRef
  metadata?: FocusNodeMetadata
  zoneId?: string
}

/**
 * A directed edge between two nodes with direction and optional weight.
 * Lower weight = higher priority when multiple edges match the same direction.
 */
export type FocusEdge = {
  fromId: string
  toId: string
  direction: Direction
  weight?: number
}

/**
 * Options for resolving the next focus target.
 */
export type ResolveOptions = {
  loop?: boolean
  skipDisabled?: boolean
  withinZoneId?: string
}
