import React, {useState, useEffect, useRef} from 'react'

import {AppContext} from './AppContext'
import DisplayRoutes from './routes'

import {ThemeType} from './types'

import './App.css'

const App = () => {
  const [themeType, setThemeType] = useState<ThemeType>('dark')

  return (
    <AppContext.Provider value={{themeType, setThemeType}}>
      <DisplayRoutes />
    </AppContext.Provider>
  )
}

export default App
