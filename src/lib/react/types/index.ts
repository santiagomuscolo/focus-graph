import type { ReactNode } from 'react'
import type { Direction } from '../../types'
import type { FocusGraph } from '../../graph'

export type FocusContextValue = {
  graph: FocusGraph
  focusNode: (id: string) => void
  restoreFocus: () => void
  registerTrapZone: (zoneId: string) => void
  unregisterTrapZone: (zoneId: string) => void
}

export type KeyBindings = Partial<Record<string, Direction>>

export type Verbosity = 'off' | 'minimal' | 'full'

export type ZoneContextValue = {
  zoneId: string | undefined
  disabled?: boolean
}

export type InitialFocusStrategy = 'first' | string

export type ScrollIntoViewOption = boolean | {
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
  behavior?: ScrollBehavior
}

export type FocusProviderProps = {
  children: ReactNode
  keyBindings?: KeyBindings
  onEscape?: () => void
  initialFocus?: InitialFocusStrategy
  verbosity?: Verbosity
  focusTransition?: boolean
  scrollIntoView?: ScrollIntoViewOption
}

export type FocusZoneProps = {
  children: ReactNode
  zoneId?: string
  disabled?: boolean
  trapFocus?: boolean
}
