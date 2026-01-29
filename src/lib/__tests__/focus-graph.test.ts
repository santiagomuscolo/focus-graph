import { describe, it, expect } from 'vitest'
import { FocusGraph } from '../graph'

describe('FocusGraph', () => {
  describe('addNode / removeNode', () => {
    it('adds and removes nodes', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      expect(g.hasNode('a')).toBe(true)
      expect(g.hasNode('b')).toBe(true)
      expect(g.getNode('a')).toEqual({ id: 'a' })
      g.removeNode('a')
      expect(g.hasNode('a')).toBe(false)
      expect(g.getNode('a')).toBeUndefined()
    })

    it('ignores duplicate addNode', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'a' })
      expect(g.getNode('a')).toEqual({ id: 'a' })
    })

    it('removing node removes connected edges', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.connect('a', 'b', 'next')
      g.removeNode('b')
      expect(g.resolve('a', 'next')).toBe(null)
    })
  })

  describe('connect / disconnect', () => {
    it('connects two nodes with direction', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.connect('a', 'b', 'next')
      expect(g.resolve('a', 'next')).toBe('b')
    })

    it('disconnect removes edge', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.connect('a', 'b', 'next')
      g.disconnect('a', 'b', 'next')
      expect(g.resolve('a', 'next')).toBe(null)
    })

    it('uses lower weight as higher priority', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.addNode({ id: 'c' })
      g.connect('a', 'c', 'next', 10)
      g.connect('a', 'b', 'next', 0)
      expect(g.resolve('a', 'next')).toBe('b')
    })

    it('ignores connect when node does not exist', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.connect('a', 'missing', 'next')
      expect(g.resolve('a', 'next')).toBe(null)
    })
  })

  describe('resolve', () => {
    it('returns null for unknown fromNodeId', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      expect(g.resolve('unknown', 'next')).toBe(null)
    })

    it('returns null when no edge in direction', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.connect('a', 'b', 'next')
      expect(g.resolve('a', 'prev')).toBe(null)
      expect(g.resolve('b', 'next')).toBe(null)
    })

    it('skips disabled nodes when skipDisabled is true (default)', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b', metadata: { disabled: true } })
      g.addNode({ id: 'c' })
      g.connect('a', 'b', 'next')
      g.connect('b', 'c', 'next')
      expect(g.resolve('a', 'next')).toBe('c')
    })

    it('does not skip disabled when skipDisabled is false', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b', metadata: { disabled: true } })
      g.connect('a', 'b', 'next')
      expect(g.resolve('a', 'next', { skipDisabled: false })).toBe('b')
    })

    it('loops to first focusable node when loop is true and no edge', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.addNode({ id: 'c' })
      g.connect('a', 'b', 'next')
      g.connect('b', 'c', 'next')
      expect(g.resolve('c', 'next', { loop: true })).toBe('a')
    })

    it('loops to last focusable node when prev from first node (Shift+Tab)', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.addNode({ id: 'c' })
      g.connect('a', 'b', 'next')
      g.connect('b', 'c', 'next')
      g.connect('b', 'a', 'prev')
      g.connect('c', 'b', 'prev')
      expect(g.resolve('a', 'prev', { loop: true })).toBe('c')
    })

    it('loop does not return same node when only one focusable', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      expect(g.resolve('a', 'next', { loop: true })).toBe(null)
    })

    it('loop skips disabled when choosing first focusable', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a', metadata: { disabled: true } })
      g.addNode({ id: 'b' })
      g.addNode({ id: 'c' })
      g.connect('b', 'c', 'next')
      expect(g.resolve('c', 'next', { loop: true })).toBe('b')
    })

    it('dead end: returns null when no edge and loop is false', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a' })
      g.addNode({ id: 'b' })
      g.connect('a', 'b', 'next')
      expect(g.resolve('b', 'next')).toBe(null)
      expect(g.resolve('b', 'next', { loop: false })).toBe(null)
    })

    it('withinZoneId only considers nodes in that zone', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'root-1' })
      g.addNode({ id: 'root-2' })
      g.addNode({ id: 'modal-1', zoneId: 'modal' })
      g.addNode({ id: 'modal-2', zoneId: 'modal' })
      g.connect('root-1', 'root-2', 'next')
      g.connect('root-1', 'modal-1', 'next')
      g.connect('modal-1', 'modal-2', 'next')
      g.connect('modal-2', 'modal-1', 'prev')
      expect(g.resolve('root-1', 'next')).toBe('root-2')
      expect(g.resolve('root-1', 'next', { withinZoneId: 'modal' })).toBe(null)
      expect(g.resolve('modal-1', 'next', { withinZoneId: 'modal' })).toBe('modal-2')
      expect(g.resolve('modal-2', 'prev', { withinZoneId: 'modal' })).toBe('modal-1')
    })

    it('loop with withinZoneId returns first focusable in that zone', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'm1', zoneId: 'modal' })
      g.addNode({ id: 'm2', zoneId: 'modal' })
      g.connect('m1', 'm2', 'next')
      g.connect('m2', 'm1', 'next')
      expect(g.resolve('m2', 'next', { loop: true, withinZoneId: 'modal' })).toBe('m1')
    })
  })

  describe('getNodeIdByElement / getFirstFocusableNodeId', () => {
    it('getNodeIdByElement returns id when elementRef matches', () => {
      const g = new FocusGraph()
      const el = document.createElement('button')
      g.addNode({ id: 'x', elementRef: el })
      expect(g.getNodeIdByElement(el)).toBe('x')
    })

    it('getNodeIdByElement returns null for unknown element', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'x', elementRef: document.createElement('button') })
      expect(g.getNodeIdByElement(document.createElement('div'))).toBe(null)
    })

    it('getFirstFocusableNodeId returns first enabled node', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a', metadata: { disabled: true } })
      g.addNode({ id: 'b' })
      g.addNode({ id: 'c' })
      expect(g.getFirstFocusableNodeId()).toBe('b')
    })

    it('getFirstFocusableNodeId returns null when all disabled', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a', metadata: { disabled: true } })
      expect(g.getFirstFocusableNodeId()).toBe(null)
    })
  })

  describe('toJSON', () => {
    it('returns serializable nodes and edges', () => {
      const g = new FocusGraph()
      g.addNode({ id: 'a', metadata: { priority: 1 } })
      g.addNode({ id: 'b', metadata: { disabled: true } })
      g.connect('a', 'b', 'next', 0)
      const json = g.toJSON()
      expect(json.nodes).toHaveLength(2)
      expect(json.nodes[0]).toMatchObject({ id: 'a', priority: 1 })
      expect(json.nodes[1]).toMatchObject({ id: 'b', disabled: true })
      expect(json.edges).toHaveLength(1)
      expect(json.edges[0]).toEqual({ fromId: 'a', toId: 'b', direction: 'next', weight: 0 })
    })
  })
})
