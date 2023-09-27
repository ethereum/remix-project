import {createContext} from 'react'
import {ICircuitAppContext} from '../types'

export const CircuitAppContext = createContext<ICircuitAppContext>({} as ICircuitAppContext)
