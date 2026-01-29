import { describe, it, expect } from 'vitest'
import { __FOCUS_GRAPH_DEBUG__ } from '../index'

describe('focus-graph lib', () => {
  it('exports debug flag (false in test by default)', () => {
    expect(typeof __FOCUS_GRAPH_DEBUG__).toBe('boolean')
  })
})
