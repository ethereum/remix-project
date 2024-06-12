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

  return (
    <AppContext.Provider value={{themeType, setThemeType}}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
