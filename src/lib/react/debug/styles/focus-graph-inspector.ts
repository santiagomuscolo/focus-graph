export const PANEL_WIDTH = 320
export const BODY_MAX_HEIGHT = 320

export const PANEL_STYLE: React.CSSProperties = {
  position: 'fixed',
  bottom: 12,
  right: 12,
  width: PANEL_WIDTH,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  color: '#e4e4e7',
  fontFamily: 'ui-monospace, SF Mono, Monaco, monospace',
  fontSize: 11,
  lineHeight: 1.5,
  borderRadius: 8,
  boxSizing: 'border-box',
  boxShadow:
    '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.03)',
  border: '1px solid transparent',
  background:
    'linear-gradient(#0f0f12, #0f0f12) padding-box, linear-gradient(135deg, rgba(6,182,212,0.3), rgba(139,92,246,0.25), rgba(236,72,153,0.2)) border-box',
  zIndex: 2147483646,
}

export const HEADER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px 8px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
}

export const HEADER_MINIMIZED_STYLE: React.CSSProperties = {
  ...HEADER_STYLE,
  borderBottom: 'none',
  padding: '8px 12px',
  cursor: 'pointer',
}

export const ICON_BUTTON_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  padding: 0,
  marginLeft: 'auto',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  color: '#a1a1aa',
  transition: 'color 0.15s ease, background 0.15s ease',
}

export const HEADER_TITLE_STYLE: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: '0.03em',
  color: '#f4f4f5',
}

export const HEADER_ACCENT_STYLE: React.CSSProperties = {
  width: 4,
  height: 4,
  borderRadius: 2,
  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
  boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
}

export const SCROLL_STYLE: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  padding: '10px 12px',
}

export const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 14,
}

export const SECTION_LABEL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 6,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#a1a1aa',
}

export const SECTION_LABEL_LINE_STYLE = (color: string): React.CSSProperties => ({
  width: 12,
  height: 1,
  background: color,
  borderRadius: 1,
  opacity: 0.8,
})

export const PRE_STYLE: React.CSSProperties = {
  margin: 0,
  padding: '8px 10px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  borderRadius: 4,
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.04)',
  fontSize: 11,
  lineHeight: 1.55,
  color: '#d4d4d8',
}

export const FOOTER_STYLE: React.CSSProperties = {
  padding: '8px 12px 10px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
}

export const BUTTON_STYLE: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 11,
  fontWeight: 500,
  cursor: 'pointer',
  background: 'rgba(139, 92, 246, 0.15)',
  color: '#c4b5fd',
  border: '1px solid rgba(139, 92, 246, 0.35)',
  borderRadius: 6,
  letterSpacing: '0.02em',
  transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
}
