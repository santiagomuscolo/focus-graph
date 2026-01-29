import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  FocusDebugOverlay,
  FocusGraphInspector,
  FocusProvider,
  FocusZone,
  useFocusController,
  useFocusGraph,
  useFocusNode,
  useFocusZone,
} from '../react'

function ReadZone() {
  const zoneId = useFocusZone()
  return <span data-testid="zone">{zoneId ?? 'none'}</span>
}

describe('React integration', () => {
  it('FocusProvider provides graph; useFocusNode registers node', async () => {
    function Inner() {
      const graph = useFocusGraph()
      const ref = useFocusNode({ id: 'btn' })
      const { focusNode } = useFocusController()
      const [mounted, setMounted] = React.useState(false)
      React.useEffect(() => {
        const t = setTimeout(() => setMounted(true), 0)
        return () => clearTimeout(t)
      }, [])
      return (
        <>
          <button ref={ref} type="button" data-testid="target-btn">Click</button>
          <button type="button" onClick={() => focusNode('btn')}>Focus btn</button>
          <span data-testid="has-node">{mounted && graph.hasNode('btn') ? 'yes' : 'no'}</span>
        </>
      )
    }
    render(
      <FocusProvider>
        <Inner />
      </FocusProvider>
    )
    await waitFor(() => expect(screen.getByTestId('has-node').textContent).toBe('yes'))
    const targetBtn = screen.getByTestId('target-btn')
    screen.getByText('Focus btn').click()
    await waitFor(() => expect(document.activeElement).toBe(targetBtn))
  })

  it('useFocusZone returns zone id from FocusZone', () => {
    render(
      <FocusProvider>
        <FocusZone zoneId="footer">
          <ReadZone />
        </FocusZone>
      </FocusProvider>
    )
    expect(screen.getByTestId('zone').textContent).toBe('footer')
  })

  it('useFocusNode with zone option registers node with zoneId', async () => {
    function Inner() {
      const graph = useFocusGraph()
      const ref = useFocusNode({ id: 'save', zone: 'footer' })
      const [mounted, setMounted] = React.useState(false)
      React.useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10)
        return () => clearTimeout(t)
      }, [])
      const node = mounted ? graph.getNode('save') : null
      return (
        <>
          <button ref={ref} type="button">Save</button>
          <span data-testid="zone-id">{node?.zoneId ?? 'none'}</span>
        </>
      )
    }
    render(
      <FocusProvider>
        <FocusZone zoneId="footer">
          <Inner />
        </FocusZone>
      </FocusProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('zone-id').textContent).toBe('footer')
    })
  })
})

describe('Keyboard handling', () => {
  it('useFocusController provides focusNode and restoreFocus', () => {
    function Inner() {
      const { focusNode, restoreFocus } = useFocusController()
      const refA = useFocusNode({ id: 'a' })
      const refB = useFocusNode({ id: 'b' })
      const graph = useFocusGraph()
      graph.connect('a', 'b', 'next')
      return (
        <>
          <button ref={refA} type="button" data-testid="btn-a">A</button>
          <button ref={refB} type="button" data-testid="btn-b">B</button>
          <button type="button" onClick={() => focusNode('b')}>Go to B</button>
          <button type="button" onClick={() => restoreFocus()}>Restore</button>
        </>
      )
    }
    render(
      <FocusProvider>
        <Inner />
      </FocusProvider>
    )
    const btnA = screen.getByTestId('btn-a')
    const btnB = screen.getByTestId('btn-b')
    btnA.focus()
    expect(document.activeElement).toBe(btnA)
    screen.getByText('Go to B').click()
    expect(document.activeElement).toBe(btnB)
    screen.getByText('Restore').click()
    expect(document.activeElement).toBe(btnB)
  })

  it('keyboard Tab moves focus to next node', async () => {
    function Inner() {
      const refA = useFocusNode({ id: 'a' })
      const refB = useFocusNode({ id: 'b' })
      const refC = useFocusNode({ id: 'c' })
      const graph = useFocusGraph()
      const [ready, setReady] = React.useState(false)
      React.useEffect(() => {
        graph.connect('a', 'b', 'next')
        graph.connect('b', 'c', 'next')
        setReady(true)
      }, [graph])
      return (
        <>
          {ready && <span data-testid="ready" />}
          <button ref={refA} type="button" data-testid="btn-a">A</button>
          <button ref={refB} type="button" data-testid="btn-b">B</button>
          <button ref={refC} type="button" data-testid="btn-c">C</button>
        </>
      )
    }
    render(
      <FocusProvider>
        <Inner />
      </FocusProvider>
    )
    await waitFor(() => expect(screen.queryByTestId('ready')).toBeTruthy())
    const btnA = screen.getByTestId('btn-a')
    const btnB = screen.getByTestId('btn-b')
    const btnC = screen.getByTestId('btn-c')
    btnA.focus()
    expect(document.activeElement).toBe(btnA)
    fireEvent.keyDown(btnA, { key: 'Tab', bubbles: true })
    await waitFor(() => expect(document.activeElement).toBe(btnB))
    fireEvent.keyDown(btnB, { key: 'Tab', bubbles: true })
    await waitFor(() => expect(document.activeElement).toBe(btnC))
  })
})

describe('Nested zones', () => {
  it('useFocusZone returns innermost zone id', () => {
    function Inner() {
      const zoneId = useFocusZone()
      return <span data-testid="inner-zone">{zoneId ?? 'none'}</span>
    }
    render(
      <FocusProvider>
        <FocusZone zoneId="outer">
          <FocusZone zoneId="inner">
            <Inner />
          </FocusZone>
        </FocusZone>
      </FocusProvider>
    )
    expect(screen.getByTestId('inner-zone').textContent).toBe('inner')
  })
})

describe('Disabled zone', () => {
  it('nodes in disabled zone are skipped by resolve', async () => {
    function FooterSaveButton() {
      const refSave = useFocusNode({ id: 'save' })
      return <button ref={refSave} type="button" data-testid="save">Save</button>
    }
    function Inner() {
      const refMain = useFocusNode({ id: 'main' })
      const refNext = useFocusNode({ id: 'next' })
      const graph = useFocusGraph()
      const [ready, setReady] = React.useState(false)
      React.useEffect(() => {
        graph.connect('main', 'save', 'next')
        graph.connect('save', 'next', 'next')
        setReady(true)
      }, [graph])
      return (
        <>
          {ready && <span data-testid="ready-disabled" />}
          <button ref={refMain} type="button" data-testid="main">Main</button>
          <FocusZone zoneId="footer" disabled>
            <FooterSaveButton />
          </FocusZone>
          <button ref={refNext} type="button" data-testid="next">Next</button>
        </>
      )
    }
    render(
      <FocusProvider>
        <Inner />
      </FocusProvider>
    )
    await waitFor(() => expect(screen.queryByTestId('ready-disabled')).toBeTruthy())
    const main = screen.getByTestId('main')
    const next = screen.getByTestId('next')
    main.focus()
    fireEvent.keyDown(main, { key: 'Tab', bubbles: true })
    await waitFor(() => expect(document.activeElement).toBe(next))
  })
})

describe('Modal-like zone', () => {
  it('keyboard navigation moves focus within zone nodes', async () => {
    function ModalContent() {
      const ref1 = useFocusNode({ id: 'modal-1' })
      const ref2 = useFocusNode({ id: 'modal-2' })
      const graph = useFocusGraph()
      const [ready, setReady] = React.useState(false)
      React.useEffect(() => {
        graph.connect('modal-1', 'modal-2', 'next')
        graph.connect('modal-2', 'modal-1', 'next')
        setReady(true)
      }, [graph])
      return (
        <FocusZone zoneId="modal">
          {ready && <span data-testid="modal-ready" />}
          <button ref={ref1} type="button" data-testid="m1">One</button>
          <button ref={ref2} type="button" data-testid="m2">Two</button>
        </FocusZone>
      )
    }
    render(
      <FocusProvider>
        <ModalContent />
      </FocusProvider>
    )
    await waitFor(() => expect(screen.queryByTestId('modal-ready')).toBeTruthy())
    const m1 = screen.getByTestId('m1')
    const m2 = screen.getByTestId('m2')
    m1.focus()
    fireEvent.keyDown(m1, { key: 'Tab', bubbles: true })
    await waitFor(() => expect(document.activeElement).toBe(m2))
    fireEvent.keyDown(m2, { key: 'Tab', bubbles: true })
    await waitFor(() => expect(document.activeElement).toBe(m1))
  })

  it('trapFocus keeps focus within zone when other nodes exist', async () => {
    function ModalButtons() {
      const refM1 = useFocusNode({ id: 'modal-1' })
      const refM2 = useFocusNode({ id: 'modal-2' })
      return (
        <>
          <button ref={refM1} type="button" data-testid="tm1">Modal 1</button>
          <button ref={refM2} type="button" data-testid="tm2">Modal 2</button>
        </>
      )
    }
    function PageWithModal() {
      const refA = useFocusNode({ id: 'root-a' })
      const refB = useFocusNode({ id: 'root-b' })
      const graph = useFocusGraph()
      const [ready, setReady] = React.useState(false)
      React.useEffect(() => {
        graph.connect('root-a', 'root-b', 'next')
        graph.connect('root-b', 'root-a', 'prev')
        graph.connect('modal-1', 'modal-2', 'next')
        graph.connect('modal-2', 'modal-1', 'prev')
        setReady(true)
      }, [graph])
      return (
        <>
          {ready && <span data-testid="trap-ready" />}
          <button ref={refA} type="button" data-testid="root-a">Root A</button>
          <button ref={refB} type="button" data-testid="root-b">Root B</button>
          <FocusZone zoneId="modal" trapFocus>
            <ModalButtons />
          </FocusZone>
        </>
      )
    }
    render(
      <FocusProvider>
        <PageWithModal />
      </FocusProvider>
    )
    await waitFor(() => expect(screen.queryByTestId('trap-ready')).toBeTruthy())
    const tm1 = screen.getByTestId('tm1')
    const tm2 = screen.getByTestId('tm2')
    const rootB = screen.getByTestId('root-b')
    tm1.focus()
    fireEvent.keyDown(tm1, { key: 'Tab', bubbles: true })
    await waitFor(() => expect(document.activeElement).toBe(tm2))
    fireEvent.keyDown(tm2, { key: 'Tab', bubbles: true })
    await waitFor(() => expect(document.activeElement).toBe(tm1))
    expect(document.activeElement).not.toBe(rootB)
  })
})

describe('Dev tools', () => {
  it('FocusDebugOverlay and FocusGraphInspector render inside FocusProvider', () => {
    render(
      <FocusProvider>
        <FocusDebugOverlay enabled={false} />
        <FocusGraphInspector enabled={false} />
        <span data-testid="child">ok</span>
      </FocusProvider>
    )
    expect(screen.getByTestId('child').textContent).toBe('ok')
  })

  it('FocusZone with trapFocus and no zoneId warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <FocusProvider>
        <FocusZone trapFocus>
          <span data-testid="inner">x</span>
        </FocusZone>
      </FocusProvider>
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('trapFocus')
    )
    warn.mockRestore()
  })
})
