import type { Direction } from '../../types'

export const DEFAULT_KEY_BINDINGS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Tab: 'next',
  'Shift+Tab': 'prev',
}

export const ESCAPE_KEY = 'Escape'
