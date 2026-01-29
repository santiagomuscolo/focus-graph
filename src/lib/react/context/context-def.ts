import { createContext } from 'react'
import type { FocusContextValue, ZoneContextValue } from '../types'

export const FocusContext = createContext<FocusContextValue | null>(null)
export const ZoneContext = createContext<ZoneContextValue>({ zoneId: undefined })
