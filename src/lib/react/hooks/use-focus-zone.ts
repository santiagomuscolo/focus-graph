import { useContext } from 'react'
import { ZoneContext } from '../context/context-def'

export function useFocusZone(): string | undefined {
  const { zoneId } = useContext(ZoneContext)
  return zoneId
}
