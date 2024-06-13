import React, {useState, useEffect, useRef} from 'react'

import {ContractVerificationPluginClient} from './ContractVerificationPluginClient'

import {AppContext} from './AppContext'
import DisplayRoutes from './routes'
import {CustomTooltip} from '@remix-ui/helper'
import {ThemeType} from './types'

import './App.css'

const plugin = new ContractVerificationPluginClient()

const App = () => {
  const [themeType, setThemeType] = useState<ThemeType>('dark')
  const [chains, setChains] = useState([]) // State to hold the chains data
  const [selectedChain, setSelectedChain] = useState(null)

  useEffect(() => {
    // Fetch chains.json and update state
    fetch('https://chainid.network/chains.json')
      .then((response) => response.json())
      .then((data) => setChains(data))
      .catch((error) => console.error('Failed to fetch chains.json:', error))
  }, [])

  return (
    <AppContext.Provider value={{themeType, setThemeType, chains, selectedChain, setSelectedChain}}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
