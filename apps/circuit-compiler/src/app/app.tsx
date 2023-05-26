import React, { useEffect, useReducer } from 'react'
import { RenderIf, RenderIfNot } from '@remix-ui/helper'
import { Alert, Button, Tabs, Tab } from 'react-bootstrap'

import { AppContext } from './contexts'
import { appInitialState, appReducer } from './reducers'
import { activateRemixd, initCircomPluginActions } from './actions'

function App() {
  const [appState, dispatch] = useReducer(appReducer, appInitialState)

  useEffect(() => {
    initCircomPluginActions()(dispatch)
  }, [])

  const handleConnectRemixd = () => {
    activateRemixd()
  }

  const value = {
    appState,
    dispatch
  }
  
  return (
    <AppContext.Provider value={value}>
      <div className="App">
        <RenderIfNot condition={appState.isRemixdConnected}>
          <Alert variant="info" dismissible>
            <Alert.Heading>Requirements!</Alert.Heading>
            <ol>
              <li>Circuit Compiler requires that you have Rust lang installed on your machine.</li>
              <li>Remix-IDE is connected to your local file system.</li>
            </ol>
            <div className="d-flex justify-content-end">
              <Button variant='outline-primary' onClick={handleConnectRemixd}>Connect to File System </Button>
            </div>
          </Alert>
        </RenderIfNot>
        <RenderIf condition={appState.isRemixdConnected}>
          <div className='mx-2 mb-2 d-flex flex-column'>
            <Tabs
              defaultActiveKey={'compile'}
              id="circuitCompilerTabs"
            >
              <Tab eventKey={'compile'} title="Compiler"></Tab>
              <Tab eventKey={'witness'} title="Witness"></Tab>
            </Tabs>
          </div>
        </RenderIf>
      </div>
    </AppContext.Provider>
  )
}

export default App