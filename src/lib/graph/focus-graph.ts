import type { Direction, FocusEdge, FocusNode, ResolveOptions } from '../types'

const DEFAULT_WEIGHT = 0

export class FocusGraph {
  private nodes = new Map<string, FocusNode>()
  private edges: FocusEdge[] = []
  private nodeOrder: string[] = []

  addNode(node: FocusNode): void {
    if (this.nodes.has(node.id)) return
    this.nodes.set(node.id, { ...node })
    this.nodeOrder.push(node.id)
  }

  removeNode(id: string): void {
    if (!this.nodes.has(id)) return
    this.nodes.delete(id)
    this.nodeOrder = this.nodeOrder.filter((n) => n !== id)
    this.edges = this.edges.filter((e) => e.fromId !== id && e.toId !== id)
  }

  connect(fromId: string, toId: string, direction: Direction, weight?: number): void {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return
    this.disconnect(fromId, toId, direction)
    this.edges.push({
      fromId,
      toId,
      direction,
      weight: weight ?? DEFAULT_WEIGHT,
    })
  }

  disconnect(fromId: string, toId?: string, direction?: Direction): void {
    this.edges = this.edges.filter((e) => {
      if (e.fromId !== fromId) return true
      if (toId != null && e.toId !== toId) return true
      if (direction != null && e.direction !== direction) return true
      return false
    })
  }

  getNode(id: string): FocusNode | undefined {
    return this.nodes.get(id)
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id)
  }

  getNodeIdByElement(element: HTMLElement): string | null {
    for (const id of this.nodeOrder) {
      const node = this.nodes.get(id)
      if (node?.elementRef === element) return id
    }
    return null
  }

  getFirstFocusableNodeId(): string | null {
    return this.getFirstFocusableNode()
  }

  private isEnabled(nodeId: string): boolean {
    const node = this.nodes.get(nodeId)
    return node != null && node.metadata?.disabled !== true
  }

  resolve(
    fromNodeId: string,
    direction: Direction,
    options: ResolveOptions = {}
  ): string | null {
    const { loop = false, skipDisabled = true, withinZoneId } = options

    if (!this.nodes.has(fromNodeId)) return null

    const fromNode = this.nodes.get(fromNodeId)
    if (withinZoneId != null && fromNode?.zoneId !== withinZoneId) {
      return null
    }

    let candidates = this.edges
      .filter((e) => e.fromId === fromNodeId && e.direction === direction)
      .sort((a, b) => (a.weight ?? DEFAULT_WEIGHT) - (b.weight ?? DEFAULT_WEIGHT))

    if (withinZoneId != null) {
      candidates = candidates.filter((e) => {
        const toNode = this.nodes.get(e.toId)
        return toNode?.zoneId === withinZoneId
      })
    }

    let nextId: string | null = null
    if (candidates.length > 0) {
      nextId = candidates[0].toId
    }

    if (nextId != null && skipDisabled && !this.isEnabled(nextId)) {
      nextId = this.resolve(nextId, direction, {
        loop: false,
        skipDisabled,
        withinZoneId,
      })
    }

    if (nextId != null) return nextId

    if (loop) {
      const isPrev = direction === 'prev' || direction === 'left' || direction === 'up'
      const wrapTarget = isPrev
        ? this.getLastFocusableNodeInZone(withinZoneId)
        : this.getFirstFocusableNodeInZone(withinZoneId)
      return wrapTarget !== fromNodeId ? wrapTarget : null
    }

    return null
  }

  private getFirstFocusableNode(): string | null {
    return this.getFirstFocusableNodeInZone(undefined)
  }

  private getFirstFocusableNodeInZone(zoneId: string | undefined): string | null {
    for (const id of this.nodeOrder) {
      const node = this.nodes.get(id)
      if (!this.isEnabled(id)) continue
      if (zoneId != null && node?.zoneId !== zoneId) continue
      return id
    }
    return null
  }

  private getLastFocusableNodeInZone(zoneId: string | undefined): string | null {
    for (let i = this.nodeOrder.length - 1; i >= 0; i--) {
      const id = this.nodeOrder[i]
      const node = this.nodes.get(id)
      if (!this.isEnabled(id)) continue
      if (zoneId != null && node?.zoneId !== zoneId) continue
      return id
    }
    return null
  }

  toJSON(): {
    nodes: Array<{ id: string; disabled?: boolean; priority?: number; role?: string }>
    edges: Array<{ fromId: string; toId: string; direction: Direction; weight?: number }>
  } {
    return {
      nodes: this.nodeOrder.map((id) => {
        const n = this.nodes.get(id)!
        return {
          id: n.id,
          ...n.metadata,
        }
      }),
      edges: this.edges.map((e) => ({
        fromId: e.fromId,
        toId: e.toId,
        direction: e.direction,
        weight: e.weight,
      })),
    }
  }
}
