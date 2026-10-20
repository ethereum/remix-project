import { createContext } from 'react'
import { EezAppContextType } from '../types'

export const EezAppContext = createContext<EezAppContextType>({} as EezAppContextType)
