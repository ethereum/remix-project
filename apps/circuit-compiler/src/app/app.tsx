import React, {useEffect, useReducer, useState} from 'react'
import {RenderIf, RenderIfNot} from '@remix-ui/helper'
import {Alert, Button, Tabs, Tab} from 'react-bootstrap'

import {AppContext} from './contexts'
import {appInitialState, appReducer} from './reducers'
import {CircomPluginClient} from './services/circomPluginClient'

function App() {
  const [appState, dispatch] = useReducer(appReducer, appInitialState)
  const [plugin, setPlugin] = useState<CircomPluginClient>(null)

  useEffect(() => {
    const plugin = new CircomPluginClient()

    setPlugin(plugin)
  }, [])

  const value = {
    appState,
    dispatch
  }

  return (
    <AppContext.Provider value={value}>
      <div className="App"></div>
    </AppContext.Provider>
  )
}

export default App
