import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type Ref,
  type RefCallback,
} from 'react'
import type { FocusNode } from '../../types'
import { FocusContext, ZoneContext } from '../context/context-def'

export interface UseFocusNodeOptions {
  id: string
  zone?: string
  ref?: Ref<HTMLElement | null>
  metadata?: FocusNode['metadata']
}

export function useFocusNode(
  options: UseFocusNodeOptions
): RefCallback<HTMLElement | null> {
  const { id, zone: zoneProp, ref: refProp, metadata } = options
  const focusValue = useContext(FocusContext)
  const zoneValue = useContext(ZoneContext)
  const zoneId = zoneProp ?? zoneValue.zoneId
  const zoneDisabled = zoneValue.disabled === true
  const graph = focusValue?.graph
  const nodeIdRef = useRef<string | null>(null)

  const effectiveMetadata = useMemo(
    () => ({
      ...metadata,
      ...(zoneDisabled && { disabled: true as const }),
    }),
    [metadata, zoneDisabled]
  )

  const setRef = useCallback<RefCallback<HTMLElement | null>>(
    (el) => {
      if (graph == null) return

      if (nodeIdRef.current != null) {
        graph.removeNode(nodeIdRef.current)
        nodeIdRef.current = null
      }

      if (el != null) {
        const node: FocusNode<HTMLElement> = {
          id,
          elementRef: el,
          metadata: effectiveMetadata,
          ...(zoneId != null && { zoneId }),
        }
        graph.addNode(node)
        nodeIdRef.current = id
      }

      if (typeof refProp === 'function') {
        refProp(el)
      } else if (refProp != null && 'current' in refProp) {
        // eslint-disable-next-line react-hooks/immutability -- ref.current is the standard API
        ;(refProp as { current: HTMLElement | null }).current = el
      }
    },
    [graph, id, zoneId, effectiveMetadata, refProp]
  )

  useEffect(() => {
    if (graph == null) return
    return () => {
      if (nodeIdRef.current != null) {
        graph.removeNode(nodeIdRef.current)
        nodeIdRef.current = null
      }
    }
  }, [graph])

  if (graph == null) {
    throw new Error('useFocusNode must be used within FocusProvider')
  }

  return setRef
}
