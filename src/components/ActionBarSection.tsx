import { useEffect } from 'react'
import { FocusZone, useFocusGraph, useFocusNode } from '../lib'

function ActionBarSaveButton() {
  const ref = useFocusNode({ id: 'action-bar-save' })
  return (
    <button ref={ref} type="button">
      Save (in zone)
    </button>
  )
}

export function ActionBarSection({ disabled }: { disabled: boolean }) {
  const refMain = useFocusNode({ id: 'action-bar-main' })
  const refNext = useFocusNode({ id: 'action-bar-next' })
  const graph = useFocusGraph()

  useEffect(() => {
    // Next (Tab): Main → Save → Next
    graph.connect('action-bar-main', 'action-bar-save', 'next')
    graph.connect('action-bar-save', 'action-bar-next', 'next')
    // Prev (Shift+Tab): Next → Save → Main
    graph.connect('action-bar-next', 'action-bar-save', 'prev')
    graph.connect('action-bar-save', 'action-bar-main', 'prev')
  }, [graph, disabled])

  return (
    <section className="demo-section" aria-labelledby="action-bar-heading">
      <h2 id="action-bar-heading" className="demo-section__title">
        Action bar {disabled && <span className="demo-section__badge">disabled</span>}
      </h2>
      <p className="demo-section__hint">
        When disabled, Tab skips the Save button and goes Main → Next.
      </p>
      <div className="button-row">
        <button ref={refMain} type="button">
          Main
        </button>
        <FocusZone zoneId="action-bar" disabled={disabled}>
          <ActionBarSaveButton />
        </FocusZone>
        <button ref={refNext} type="button">
          Next
        </button>
      </div>
    </section>
  )
}
