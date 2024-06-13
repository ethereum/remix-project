import React from 'react'
import {ThemeType} from './types'

export const AppContext = React.createContext({
  themeType: 'dark' as ThemeType,
  setThemeType: (themeType: ThemeType) => {
    console.log('Calling Set Theme Type')
  },
  chains: [],
  selectedChain: null,
  setSelectedChain: (chain: string) => {},
})
