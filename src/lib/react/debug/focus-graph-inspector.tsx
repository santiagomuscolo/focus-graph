import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFocusGraph } from '../hooks/use-focus-graph'
import {
  BODY_MAX_HEIGHT,
  BUTTON_STYLE,
  FOOTER_STYLE,
  HEADER_ACCENT_STYLE,
  HEADER_MINIMIZED_STYLE,
  HEADER_STYLE,
  HEADER_TITLE_STYLE,
  ICON_BUTTON_STYLE,
  PANEL_STYLE,
  PRE_STYLE,
  SCROLL_STYLE,
  SECTION_LABEL_LINE_STYLE,
  SECTION_LABEL_STYLE,
  SECTION_STYLE,
} from './styles/focus-graph-inspector'

export type FocusGraphInspectorProps = {
  enabled?: boolean
  pollIntervalMs?: number
}

export function FocusGraphInspector({
  enabled = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production',
  pollIntervalMs = 2000,
}: FocusGraphInspectorProps) {
  const graph = useFocusGraph()
  const [snapshot, setSnapshot] = useState<ReturnType<typeof graph.toJSON> | null>(null)
  const [minimized, setMinimized] = useState(false)

  const refresh = useCallback(() => {
    setSnapshot(graph.toJSON())
  }, [graph])

  useEffect(() => {
    if (!enabled) return
    refresh()
    if (pollIntervalMs <= 0) return
    const id = setInterval(refresh, pollIntervalMs)
    return () => clearInterval(id)
  }, [enabled, pollIntervalMs, refresh])

  if (!enabled) return null

  const nodesJson = snapshot ? JSON.stringify(snapshot.nodes, null, 2) : null
  const edgesJson = snapshot ? JSON.stringify(snapshot.edges, null, 2) : null
  const loading = !snapshot
  const nodeCount = snapshot?.nodes.length ?? 0
  const edgeCount = snapshot?.edges.length ?? 0

  const handleToggleMinimize = (e: React.MouseEvent) => {
    if (minimized) {
      setMinimized(false)
    } else {
      e.stopPropagation()
      setMinimized(true)
    }
  }

  const bodyWrapperStyle: React.CSSProperties = {
    overflow: 'hidden',
    maxHeight: minimized ? 0 : BODY_MAX_HEIGHT,
    transition: 'max-height 0.28s ease-out',
    flexShrink: 0,
  }

  const bodyContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    height: minimized ? undefined : BODY_MAX_HEIGHT,
    opacity: minimized ? 0 : 1,
    transition: 'opacity 0.2s ease-out',
  }

  return createPortal(
    <div style={PANEL_STYLE} aria-label="Focus graph inspector">
      <header
        style={minimized ? HEADER_MINIMIZED_STYLE : HEADER_STYLE}
        onClick={minimized ? () => setMinimized(false) : undefined}
        role={minimized ? 'button' : undefined}
        tabIndex={minimized ? 0 : undefined}
        onKeyDown={
          minimized
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setMinimized(false)
                }
              }
            : undefined
        }
      >
        <span style={HEADER_ACCENT_STYLE} aria-hidden />
        <span style={HEADER_TITLE_STYLE}>Focus Graph</span>
        {minimized && (
          <span style={{ fontSize: 10, color: '#71717a', marginLeft: 6 }}>
            {nodeCount} nodes · {edgeCount} edges
          </span>
        )}
        <button
          type="button"
          style={ICON_BUTTON_STYLE}
          onClick={handleToggleMinimize}
          title={minimized ? 'Expand' : 'Minimize'}
          aria-label={minimized ? 'Expand inspector' : 'Minimize inspector'}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e4e4e7'
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a1a1aa'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {minimized ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
      </header>

      <div style={bodyWrapperStyle}>
        <div style={bodyContentStyle}>
          <div style={SCROLL_STYLE}>
            {loading ? (
              <pre style={PRE_STYLE}>Loading…</pre>
            ) : (
              <>
                <section style={SECTION_STYLE}>
                  <div style={SECTION_LABEL_STYLE}>
                    <span style={SECTION_LABEL_LINE_STYLE('#06b6d4')} />
                    Nodes
                  </div>
                  <pre style={PRE_STYLE}>{nodesJson}</pre>
                </section>
                <section style={SECTION_STYLE}>
                  <div style={SECTION_LABEL_STYLE}>
                    <span style={SECTION_LABEL_LINE_STYLE('#8b5cf6')} />
                    Edges
                  </div>
                  <pre style={PRE_STYLE}>{edgesJson}</pre>
                </section>
              </>
            )}
          </div>

          <footer style={FOOTER_STYLE}>
            <button
              type="button"
              style={BUTTON_STYLE}
              onClick={refresh}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)'
                e.currentTarget.style.boxShadow = '0 0 12px rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Refresh
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  )
}
