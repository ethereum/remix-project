import {createContext} from 'react'
import {IAppContext} from '../types'

export const AppContext = createContext<IAppContext>({} as IAppContext)
