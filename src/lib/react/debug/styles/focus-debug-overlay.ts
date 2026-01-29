export const BOX_STYLE: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    borderRadius: 6,
    zIndex: 2147483647,
    transition:
      'left 0.08s ease-out, top 0.08s ease-out, width 0.08s ease-out, height 0.08s ease-out, box-shadow 0.2s ease',
    border: '2px solid linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899, #f59e0b)',
  }
  
export const BADGE_STYLE: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 2147483647,
    fontFamily: 'ui-monospace, SF Mono, Monaco, monospace',
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 4,
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    color: '#e9d5ff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(139, 92, 246, 0.5)',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    transition: 'left 0.08s ease-out, top 0.08s ease-out',
  }