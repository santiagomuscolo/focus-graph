# Focus Graph – Keyboard-First Navigation for React

## Usage

### Installation

```bash
npm install focus-graph
# or
pnpm add focus-graph
```

Peer dependency: React 18 or 19.

### Minimal setup

Wrap your app (or the part that uses the graph) with `FocusProvider`. Register focusable elements with `useFocusNode` and connect them with `graph.connect`.

```tsx
import { FocusProvider, useFocusNode, useFocusGraph } from 'focus-graph'

function Buttons() {
  const refA = useFocusNode({ id: 'btn-a' })
  const refB = useFocusNode({ id: 'btn-b' })
  const graph = useFocusGraph()

  useEffect(() => {
    graph.connect('btn-a', 'btn-b', 'next')
    graph.connect('btn-b', 'btn-a', 'prev')
  }, [graph])

  return (
    <>
      <button ref={refA} type="button">
        A
      </button>
      <button ref={refB} type="button">
        B
      </button>
    </>
  )
}

function App() {
  return (
    <FocusProvider>
      <Buttons />
    </FocusProvider>
  )
}
```

Tab moves A → B; Shift+Tab moves B → A. Focus stays inside the graph.

### Linear flow (Tab / Shift+Tab)

Connect nodes in a cycle so Tab goes “next” and Shift+Tab goes “prev”:

```tsx
useEffect(() => {
  graph.connect('a', 'b', 'next')
  graph.connect('b', 'c', 'next')
  graph.connect('c', 'a', 'next') // loop
  graph.connect('b', 'a', 'prev')
  graph.connect('c', 'b', 'prev')
}, [graph])
```

Default key bindings: `Tab` → `next`, `Shift+Tab` → `prev`, arrows → `up`/`down`/`left`/`right`.

### Zones and disabled nodes

Use `<FocusZone zoneId="action-bar" disabled={actionBarDisabled}>` to group nodes. Nodes inside a disabled zone get `metadata.disabled: true` and are skipped by the resolver. Re-connect edges when the zone is toggled, because re-registering a node (e.g. when `disabled` changes) calls `graph.removeNode(id)` and clears all edges involving that id.

```tsx
<FocusZone zoneId="action-bar" disabled={actionBarDisabled}>
  <SaveButton /> {/* useFocusNode inside; when disabled, Tab skips this node */}
</FocusZone>
```

In your zone’s `useEffect`, include `disabled` in the dependency array so edges are re-established after toggle:

```tsx
useEffect(() => {
  graph.connect('action-bar-main', 'action-bar-save', 'next')
  graph.connect('action-bar-save', 'action-bar-next', 'next')
  graph.connect('action-bar-next', 'action-bar-save', 'prev')
  graph.connect('action-bar-save', 'action-bar-main', 'prev')
}, [graph, disabled])
```

### Modal (focus trap)

Wrap the modal content in a zone with `trapFocus`. Focus stays inside until Escape (or your `onEscape` handler).

```tsx
<FocusZone zoneId="modal" trapFocus>
  <ModalButtons />
</FocusZone>
```

Lift modal open state so `FocusProvider`’s `onEscape` can close it:

```tsx
<FocusProvider onEscape={() => setModalOpen(false)}>
  {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
</FocusProvider>
```

### Programmatic focus

Use `useFocusController()` to move focus or restore the last focused node:

```tsx
const { focusNode, restoreFocus } = useFocusController()
focusNode('save-button')
restoreFocus()
```

### Debug tools (dev)

When `VITE_FOCUS_GRAPH_DEBUG__=true` in your `.env`, you can render the overlay and inspector inside `FocusProvider`:

```tsx
import {
  __FOCUS_GRAPH_DEBUG__,
  FocusDebugOverlay,
  FocusGraphInspector,
} from 'focus-graph'

{
  __FOCUS_GRAPH_DEBUG__ && (
    <>
      <FocusDebugOverlay enabled />
      <FocusGraphInspector enabled pollIntervalMs={2000} />
    </>
  )
}
```

Copy `.env.example` to `.env` and set the variable to `true` or `false`; Vite loads only `.env`, not `.env.example`.

---

## Mental model

- **Graph** — A single directed graph: **nodes** (focusable elements) and **edges** (from → to, with a **direction**).
- **Directions** — `next` / `prev` (Tab / Shift+Tab) and `up` / `down` / `left` / `right` (arrows). You decide which keys map to which direction via `keyBindings`.
- **Resolver** — For the currently focused node and the key pressed, the graph finds all outgoing edges for that direction, skips disabled nodes, optionally loops at boundaries, and returns the next node (or null). The provider then focuses that node’s element.
- **Zones** — Optional groups (`zoneId`). Used for: (1) disabling a whole group (`FocusZone disabled`), (2) trapping focus in a modal (`FocusZone trapFocus`). When focus is inside a trap zone, resolution is restricted to nodes in that zone.
- **No magic** — You register nodes and call `graph.connect(fromId, toId, direction)`. Order and connections are explicit, so behavior is predictable and testable.

---

## API reference

### Components

| Component             | Props                                                                                                         | Description                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `FocusProvider`       | `children`, `keyBindings?`, `onEscape?`, `initialFocus?`, `verbosity?`, `focusTransition?`, `scrollIntoView?` | Provides the graph and key handling. Wrap the tree that uses the focus graph.            |
| `FocusZone`           | `children`, `zoneId?`, `disabled?`, `trapFocus?`                                                              | Groups nodes; `disabled` marks them as skipped; `trapFocus` keeps focus inside the zone. |
| `FocusDebugOverlay`   | `enabled?`                                                                                                    | Dev overlay that highlights the focused node (default: dev only).                        |
| `FocusGraphInspector` | `enabled?`, `pollIntervalMs?`                                                                                 | Dev panel showing `graph.toJSON()` (nodes + edges).                                      |

### FocusProvider props

- **keyBindings** — `Partial<Record<string, Direction>>`. Override default keys (e.g. `Tab: 'next'`, `Shift+Tab: 'prev'`, arrows).
- **onEscape** — `() => void`. Called when Escape is pressed while focus is on a graph node.
- **initialFocus** — `'first'` or a node id string. Focus that node after mount (with a short delay for refs).
- **verbosity** — `'off' | 'minimal' | 'full'`. Live region announcement level.
- **focusTransition** — `boolean`. Sets `data-focus-graph-just-focused` briefly on the focused element (respects `prefers-reduced-motion`).
- **scrollIntoView** — `boolean \| { block?, inline?, behavior? }`. Scroll focused element into view (default: `{ block: 'nearest', behavior: 'instant' }`).

### Hooks

| Hook                                           | Returns / purpose                                                                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useFocusNode({ id, zone?, ref?, metadata? })` | Ref callback to attach to a focusable element. Registers the node on mount, unregisters on unmount. Nodes inside a disabled `FocusZone` get `metadata.disabled: true`. |
| `useFocusGraph()`                              | The `FocusGraph` instance (for `connect`, `disconnect`, `resolve`, `toJSON`, etc.).                                                                                    |
| `useFocusZone()`                               | Current `zoneId` from the nearest `FocusZone`.                                                                                                                         |
| `useFocusController()`                         | `{ focusNode(id), restoreFocus() }` for programmatic focus.                                                                                                            |

### FocusGraph (from useFocusGraph)

- **connect(fromId, toId, direction, weight?)** — Add or replace an edge. `direction`: `'up' | 'down' | 'left' | 'right' | 'next' | 'prev'`.
- **disconnect(fromId, toId?, direction?)** — Remove edges. Omit `toId`/`direction` to remove all edges from `fromId`.
- **resolve(fromNodeId, direction, options?)** — Returns the next node id or null. Options: `{ loop?, skipDisabled?, withinZoneId? }`.
- **getNode(id)**, **hasNode(id)** — Node lookup.
- **getNodeIdByElement(element)** — Resolve DOM element to node id (used by the provider for key handling).
- **getFirstFocusableNodeId()** — First enabled node in registration order.
- **toJSON()** — `{ nodes, edges }` for debugging.

### Types (exported)

- **Direction** — `'up' | 'down' | 'left' | 'right' | 'next' | 'prev'`.
- **FocusNode**, **FocusNodeMetadata** — Node shape (id, elementRef, metadata, zoneId).
- **FocusEdge** — Edge shape (fromId, toId, direction, weight?).
- **ResolveOptions** — `{ loop?, skipDisabled?, withinZoneId? }`.
- **KeyBindings**, **Verbosity**, **InitialFocusStrategy**, **FocusProviderProps**, **FocusZoneProps**, etc.

---

## Common pitfalls

1. **Re-registering a node clears its edges** — When `useFocusNode`’s ref runs again with new metadata (e.g. zone toggled from disabled to enabled), it calls `graph.removeNode(id)`, which removes all edges involving that id. Re-connect in a `useEffect` that depends on the same toggle (e.g. `[graph, disabled]`) so edges are restored.
2. **Debug tools always on** — The library only turns debug on when `VITE_FOCUS_GRAPH_DEBUG__` is the string `'true'`. Create a `.env` from `.env.example` and set it to `true` or `false`; Vite does not load `.env.example`.
3. **Wiring order and cross-section edges** — If you wire “Linear” and “Action bar” in separate effects, a parent effect can add cross-section edges (e.g. last linear node → first action-bar node) and clean up only those edges so it doesn’t remove the sections’ own connections.
4. **Tab from “last” node** — Ensure there is a `next` edge from the last node (e.g. to the first node for a loop, or to the next section). Otherwise the resolver returns null and the browser’s default Tab behavior can move focus outside the graph.

---

## Comparison with tab-based navigation

| Aspect       | Native tab order                                         | Focus Graph                                            |
| ------------ | -------------------------------------------------------- | ------------------------------------------------------ |
| **Model**    | DOM order (tabindex, source order)                       | Explicit graph: nodes + directional edges              |
| **Control**  | Limited (tabindex, inert, tab order)                     | Full: you define every next/prev and optional zones    |
| **Loops**    | Not defined                                              | Configurable per direction (e.g. wrap at end)          |
| **Skipping** | `inert`, `tabindex=-1`, or remove from DOM               | `metadata.disabled` or zone `disabled`; resolver skips |
| **Modals**   | Focus trap via focus management and often tabindex hacks | `FocusZone trapFocus` + `withinZoneId` in resolver     |
| **Testing**  | Hard to assert “next focus is X”                         | Graph and resolver are pure; easy to unit test         |
| **Use case** | Simple forms, single column                              | Complex UIs, custom order, zones, modals               |

Use the focus graph when you need **predictable, custom keyboard order**, **zones**, or **modals**. Use native tab order when a simple, DOM-ordered flow is enough.
