import { useEffect, useState } from 'react'
import { FocusZone, useFocusGraph, useFocusNode } from '../lib'

function ModalButtons() {
  const ref1 = useFocusNode({ id: 'modal-1' })
  const ref2 = useFocusNode({ id: 'modal-2' })
  return (
    <>
      <button ref={ref1} type="button">
        Modal One
      </button>
      <button ref={ref2} type="button">
        Modal Two
      </button>
    </>
  )
}

export function ModalSection({ onClose }: { onClose: () => void }) {
  const graph = useFocusGraph()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    graph.connect('modal-1', 'modal-2', 'next')
    graph.connect('modal-2', 'modal-1', 'prev')
    setReady(true)
  }, [graph])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="modal__title">
          Focus trap
        </h2>
        <p className="modal__hint">Tab cycles inside the dialog. Escape closes.</p>
        {ready && (
          <FocusZone zoneId="modal" trapFocus>
            <div className="button-row">
              <ModalButtons />
            </div>
          </FocusZone>
        )}
        <button type="button" className="modal__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
