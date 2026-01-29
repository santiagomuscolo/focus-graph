import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FocusGraph } from '../../graph'
import { getAccessibleName } from '../a11y'
import { useReducedMotion } from '../a11y/use-reduced-motion'
import {
  warnInitialFocusNodeNotFound,
  warnInvalidKeyBindings,
  warnTrapFocusWithoutZoneId,
} from '../debug/warn-invalid-config'
import { handleKeyDown } from '../keyboard'
import type {
  FocusContextValue,
  FocusProviderProps,
  FocusZoneProps,
  ZoneContextValue,
} from '../types'

const FOCUS_TRANSITION_DURATION_MS = 200

const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

export const FocusContext = createContext<FocusContextValue | null>(null)

export const ZoneContext = createContext<ZoneContextValue>({ zoneId: undefined })

const DEFAULT_SCROLL_INTO_VIEW = {
  block: 'nearest' as ScrollLogicalPosition,
  inline: 'nearest' as ScrollLogicalPosition,
  behavior: 'instant' as ScrollBehavior,
}

export function FocusProvider({
  children,
  keyBindings,
  onEscape,
  initialFocus,
  verbosity = 'minimal',
  focusTransition = false,
  scrollIntoView = true,
}: FocusProviderProps) {
  const [graph] = useState(() => new FocusGraph())
  const lastFocusedNodeIdRef = useRef<string | null>(null)
  const liveRegionRef = useRef<HTMLDivElement>(null)
  const trapZoneIdsRef = useRef<Set<string>>(new Set())
  const reducedMotion = useReducedMotion()

  const focusNode = useCallback(
    (id: string) => {
      const node = graph.getNode(id)
      const el = node?.elementRef as HTMLElement | undefined
      if (!el) return

      const prevId = lastFocusedNodeIdRef.current
      if (prevId) {
        const prevNode = graph.getNode(prevId)
        const prevEl = prevNode?.elementRef as HTMLElement | undefined
        if (prevEl) prevEl.removeAttribute('aria-current')
      }

      el.focus()
      if (scrollIntoView && typeof el.scrollIntoView === 'function') {
        const opts =
          scrollIntoView === true
            ? DEFAULT_SCROLL_INTO_VIEW
            : { ...DEFAULT_SCROLL_INTO_VIEW, ...scrollIntoView }
        el.scrollIntoView(opts)
      }
      el.setAttribute('aria-current', 'true')
      lastFocusedNodeIdRef.current = id

      if (verbosity !== 'off' && liveRegionRef.current) {
        const name = getAccessibleName(el) || id
        const role = node?.metadata?.role
        const text = verbosity === 'full' && role ? `${role}: ${name}` : name
        liveRegionRef.current.textContent = text
      }

      if (focusTransition && !reducedMotion) {
        el.setAttribute('data-focus-graph-just-focused', 'true')
        setTimeout(() => {
          el.removeAttribute('data-focus-graph-just-focused')
        }, FOCUS_TRANSITION_DURATION_MS)
      }
    },
    [graph, verbosity, focusTransition, reducedMotion, scrollIntoView]
  )

  const restoreFocus = useCallback(() => {
    const id = lastFocusedNodeIdRef.current
    if (id) {
      const node = graph.getNode(id)
      const el = node?.elementRef as HTMLElement | undefined
      if (el) el.focus()
    }
  }, [graph])

  const setLastFocusedNodeId = useCallback((id: string | null) => {
    lastFocusedNodeIdRef.current = id
  }, [])

  const registerTrapZone = useCallback((zoneId: string) => {
    trapZoneIdsRef.current.add(zoneId)
  }, [])
  const unregisterTrapZone = useCallback((zoneId: string) => {
    trapZoneIdsRef.current.delete(zoneId)
  }, [])

  const value = useMemo<FocusContextValue>(
    () => ({ graph, focusNode, restoreFocus, registerTrapZone, unregisterTrapZone }),
    [graph, focusNode, restoreFocus, registerTrapZone, unregisterTrapZone]
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target as HTMLElement
      const fromId = graph.getNodeIdByElement(target)
      const fromNode = fromId != null ? graph.getNode(fromId) : undefined
      const withinZoneId =
        fromNode?.zoneId != null && trapZoneIdsRef.current.has(fromNode.zoneId)
          ? fromNode.zoneId
          : undefined
      const handled = handleKeyDown({
        event: event.nativeEvent,
        graph,
        keyBindings,
        onEscape,
        focusNode,
        setLastFocusedNodeId,
        resolveOptions: { loop: true, withinZoneId },
      })
      if (handled) event.preventDefault()
    },
    [graph, keyBindings, onEscape, focusNode, setLastFocusedNodeId]
  )

  const onFocusIn = useCallback(
    (event: React.FocusEvent) => {
      const target = event.target as HTMLElement
      const id = graph.getNodeIdByElement(target)
      if (id != null) lastFocusedNodeIdRef.current = id
    },
    [graph]
  )

  useEffect(() => {
    if (keyBindings) warnInvalidKeyBindings(keyBindings)
  }, [keyBindings])

  useEffect(() => {
    if (initialFocus == null) return
    const t = setTimeout(() => {
      if (initialFocus === 'first') {
        const id = graph.getFirstFocusableNodeId()
        if (id) focusNode(id)
      } else if (typeof initialFocus === 'string') {
        if (!graph.hasNode(initialFocus)) {
          warnInitialFocusNodeNotFound(initialFocus)
        } else {
          focusNode(initialFocus)
        }
      }
    }, 0)
    return () => clearTimeout(t)
  }, [graph, initialFocus, focusNode])

  return (
    <FocusContext.Provider value={value}>
      {verbosity !== 'off' && (
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic
          style={visuallyHiddenStyle}
        />
      )}
      <div
        onKeyDown={onKeyDown}
        onFocus={onFocusIn}
        style={{ outline: 'none', display: 'contents' }}
      >
        {children}
      </div>
    </FocusContext.Provider>
  )
}

export function FocusZone({
  children,
  zoneId,
  disabled = false,
  trapFocus = false,
}: FocusZoneProps) {
  const focusValue = useContext(FocusContext)
  const value = useMemo<ZoneContextValue>(
    () => ({ zoneId, disabled }),
    [zoneId, disabled]
  )

  if (trapFocus && zoneId == null) {
    warnTrapFocusWithoutZoneId()
  }

  useEffect(() => {
    if (!trapFocus || zoneId == null || focusValue == null) return
    focusValue.registerTrapZone(zoneId)
    return () => focusValue.unregisterTrapZone(zoneId)
  }, [trapFocus, zoneId, focusValue])

  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>
}
