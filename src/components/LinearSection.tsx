import { useEffect } from 'react'
import { useFocusGraph, useFocusNode } from '../lib'

export function LinearSection() {
  const refA = useFocusNode({ id: 'linear-a' })
  const refB = useFocusNode({ id: 'linear-b' })
  const refC = useFocusNode({ id: 'linear-c' })
  const graph = useFocusGraph()

  useEffect(() => {
    graph.connect('linear-a', 'linear-b', 'next')
    graph.connect('linear-b', 'linear-c', 'next')
    graph.connect('linear-c', 'linear-a', 'next')
    graph.connect('linear-c', 'linear-b', 'prev')
    graph.connect('linear-b', 'linear-a', 'prev')
  }, [graph])

  return (
    <section className="demo-section" aria-labelledby="linear-heading">
      <h2 id="linear-heading" className="demo-section__title">
        Linear
      </h2>
      <p className="demo-section__hint">Tab and Shift+Tab move focus A → B → C → A…</p>
      <div className="button-row">
        <button ref={refA} type="button" data-focus-id="linear-a">
          A
        </button>
        <button ref={refB} type="button" data-focus-id="linear-b">
          B
        </button>
        <button ref={refC} type="button" data-focus-id="linear-c">
          C
        </button>
      </div>
    </section>
  )
}
