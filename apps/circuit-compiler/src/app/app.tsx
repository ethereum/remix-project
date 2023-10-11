import React, {useEffect, useReducer, useState} from 'react'
import {RenderIf} from '@remix-ui/helper'
import {IntlProvider} from 'react-intl'

import { Container } from './components/container'
import {CircuitAppContext} from './contexts'
import {appInitialState, appReducer} from './reducers/state'
import {CircomPluginClient} from './services/circomPluginClient'
import { compileCircuit } from './actions'

function App() {
  const [appState, dispatch] = useReducer(appReducer, appInitialState)
  const [plugin, setPlugin] = useState<CircomPluginClient>(null)
  const [locale, setLocale] = useState<{code: string; messages: any}>({
    code: 'en',
    messages: null
  })
  const [isContentChanged, setIsContentChanged] = useState<boolean>(false)
  const [content, setNewContent] = useState<string>("")

  useEffect(() => {
    const plugin = new CircomPluginClient()

    plugin.internalEvents.on('circom_activated', () => {
      // @ts-ignore
      plugin.on('locale', 'localeChanged', (locale: any) => {
        setLocale(locale)
      })
      plugin.on('fileManager', 'currentFileChanged', (filePath) => {
        if (filePath.endsWith('.circom')) {
          dispatch({ type: 'SET_FILE_PATH', payload: filePath })
        } else {
          dispatch({ type: 'SET_FILE_PATH', payload: '' })
        }
      })
      // @ts-ignore
      plugin.on('editor', 'contentChanged', async (filePath, content) => {
        setIsContentChanged(true)
        setNewContent(content)
      })
      setPlugin(plugin)
    })
    plugin.internalEvents.on('circuit_compiling', () => dispatch({ type: 'SET_COMPILER_STATUS', payload: 'compiling' }))
    plugin.internalEvents.on('circuit_done', (signalInputs) => {
      signalInputs = (signalInputs || []).filter(input => input)
      dispatch({ type: 'SET_SIGNAL_INPUTS', payload: signalInputs })
      dispatch({ type: 'SET_COMPILER_STATUS', payload: 'idle' })
    })
    plugin.internalEvents.on('circuit_errored', (err) => dispatch({ type: 'SET_COMPILER_STATUS', payload: err.message }))
  }, [])

  useEffect(() => {
    if (isContentChanged) {
      (async () => {
        if (appState.autoCompile) await compileCircuit(plugin, appState, dispatch)
      })()
      setIsContentChanged(false)
    }
  }, [appState.autoCompile, isContentChanged])

  useEffect(() => {
    if (plugin) {
      setCurrentLocale()
    }
  }, [plugin])

  useEffect(() => {
    if (appState.filePath) {
      (async () => {
        if (appState.autoCompile) await compileCircuit(plugin, appState, dispatch)
      })()
    }
  }, [appState.filePath])

  const setCurrentLocale = async () => {
    // @ts-ignore
    const currentLocale = await plugin.call('locale', 'currentLocale')

    setLocale(currentLocale)
  }

  const value = {
    appState,
    dispatch,
    plugin
  }

  return (
    <div className="circuit_compiler_app">
      <RenderIf condition={locale.messages}>
        <IntlProvider locale={locale.code} messages={locale.messages}>
          <CircuitAppContext.Provider value={value}>
            <Container />
          </CircuitAppContext.Provider>
        </IntlProvider>
      </RenderIf>
    </div>
  )
}

export default App
