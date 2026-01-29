import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusGraph } from '../hooks/use-focus-graph'
import { BADGE_STYLE, BOX_STYLE } from './styles/focus-debug-overlay'

const BADGE_OFFSET = -28

export type FocusDebugOverlayProps = {
  enabled?: boolean
}

export function FocusDebugOverlay({
  enabled = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production',
}: FocusDebugOverlayProps) {
  const graph = useFocusGraph()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [nodeId, setNodeId] = useState<string | null>(null)
  const focusedElRef = useRef<HTMLElement | null>(null)

  const updateRect = useCallback(() => {
    const el = focusedElRef.current
    if (!el || !document.body.contains(el)) {
      setRect(null)
      setNodeId(null)
      return
    }
    setRect(el.getBoundingClientRect())
    const id = graph.getNodeIdByElement(el)
    setNodeId(id)
  }, [graph])

  useEffect(() => {
    if (!enabled) return

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (!target || !graph.getNodeIdByElement(target)) return
      focusedElRef.current = target
      updateRect()
    }

    const onFocusOut = () => {
      focusedElRef.current = null
      setRect(null)
      setNodeId(null)
    }

    document.addEventListener('focusin', onFocusIn, true)
    document.addEventListener('focusout', onFocusOut, true)
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      document.removeEventListener('focusin', onFocusIn, true)
      document.removeEventListener('focusout', onFocusOut, true)
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [enabled, graph, updateRect])

  if (!enabled || rect == null) return null

  return createPortal(
    <>
      <div
        style={{
          ...BOX_STYLE,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
        aria-hidden
      />
      {nodeId != null && (
        <div
          style={{
            ...BADGE_STYLE,
            left: rect.left,
            top: rect.top + BADGE_OFFSET,
          }}
          aria-hidden
        >
          {nodeId}
        </div>
      )}
    </>,
    document.body
  )
}
