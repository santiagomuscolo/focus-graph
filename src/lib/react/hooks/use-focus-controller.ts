import { useContext } from 'react'
import { FocusContext } from '../context/context-def'

export function useFocusController(): {
  focusNode: (id: string) => void
  restoreFocus: () => void
} {
  const value = useContext(FocusContext)
  if (value == null) {
    throw new Error('useFocusController must be used within FocusProvider')
  }
  return { focusNode: value.focusNode, restoreFocus: value.restoreFocus }
}
