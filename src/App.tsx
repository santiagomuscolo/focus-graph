import { useState } from 'react'
import './App.css'
import {
  __FOCUS_GRAPH_DEBUG__,
  FocusDebugOverlay,
  FocusGraphInspector,
  FocusProvider,
} from './lib'
import { AppContent } from './components'

function App() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <FocusProvider
      onEscape={() => {
        if (modalOpen) setModalOpen(false)
      }}
    >
      <AppContent modalOpen={modalOpen} setModalOpen={setModalOpen} />
      {__FOCUS_GRAPH_DEBUG__ && (
        <>
          <FocusDebugOverlay enabled />
          <FocusGraphInspector enabled pollIntervalMs={2000} />
        </>
      )}
    </FocusProvider>
  )
}

export default App
