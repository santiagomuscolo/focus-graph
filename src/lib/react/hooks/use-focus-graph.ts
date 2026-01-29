import { useContext } from 'react'
import type { FocusGraph } from '../../graph'
import { FocusContext } from '../context/context'

export function useFocusGraph(): FocusGraph {
  const value = useContext(FocusContext)
  if (value == null) {
    throw new Error('useFocusGraph must be used within FocusProvider')
  }
  return value.graph
}
