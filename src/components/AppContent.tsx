import { useEffect, useState } from 'react'
import { useFocusGraph } from '../lib'
import { ActionBarSection } from './ActionBarSection'
import { LinearSection } from './LinearSection'
import { ModalSection } from './ModalSection'

export function AppContent({
  modalOpen,
  setModalOpen,
}: {
  modalOpen: boolean
  setModalOpen: (v: boolean) => void
}) {
  const [actionBarDisabled, setActionBarDisabled] = useState(true)
  const graph = useFocusGraph()

  // LinearSection sets A→B→C→A; we overwrite C→A with C→action-bar-main and add action-bar-next→A.
  useEffect(() => {
    function wire() {
      if (!graph.hasNode('linear-a') || !graph.hasNode('action-bar-main')) return false

      graph.connect('linear-c', 'action-bar-main', 'next')
      graph.connect('action-bar-next', 'linear-a', 'next')
      graph.connect('action-bar-main', 'linear-c', 'prev')
      graph.connect('linear-a', 'action-bar-next', 'prev')
      return true
    }

    if (!wire()) {
      const t = setTimeout(wire, 0)
      return () => clearTimeout(t)
    }

    return () => {
      graph.disconnect('linear-c', 'action-bar-main', 'next')
      graph.disconnect('action-bar-next', 'linear-a', 'next')
      graph.disconnect('action-bar-main', 'linear-c', 'prev')
      graph.disconnect('linear-a', 'action-bar-next', 'prev')
    }
  }, [graph])

  return (
    <main className="app-main">
      <header className="app-header">
        <h1 className="app-title">Focus Graph</h1>
        <p className="app-intro">
          Keyboard-first navigation. Use <kbd className="kbd">Tab</kbd> and{' '}
          <kbd className="kbd">Shift+Tab</kbd> to move focus between nodes.
        </p>
      </header>

      <LinearSection />

      <ActionBarSection disabled={actionBarDisabled} />
      <div className="toggle-row">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={actionBarDisabled}
            onChange={(e) => setActionBarDisabled(e.target.checked)}
            className="toggle-input"
          />
          <span>Disable action bar (Tab skips Save)</span>
        </label>
      </div>

      <section className="demo-section demo-section--modal" aria-labelledby="modal-section-heading">
        <h2 id="modal-section-heading" className="demo-section__title">Modal & focus trap</h2>
        <p className="demo-section__hint">
          Open the dialog to see focus trapped inside. Tab cycles between the two buttons; Escape closes.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
          Open modal
        </button>
        {modalOpen && <ModalSection onClose={() => setModalOpen(false)} />}
      </section>
    </main>
  )
}
