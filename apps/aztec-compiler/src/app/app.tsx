import { useReducer } from 'react'
import { IntlProvider } from 'react-intl'
import { RenderIf } from '@remix-ui/helper'
import { Compile } from './components/Compile'
import { pluginReducer, initialState } from './reducers/state'
import { AztecPluginClient } from './services/aztecPluginClient'
import { PluginContext } from './contexts/pluginContext'

const plugin = new AztecPluginClient()

function App() {
  const [state, dispatch] = useReducer(pluginReducer, initialState)

  return (
    <div className="aztec_plugin_app">
      <RenderIf condition={true}>
        <IntlProvider locale="en" messages={{}}>
          <PluginContext.Provider value={{ plugin, dispatch, state }}>
            <Compile />
          </PluginContext.Provider>
        </IntlProvider>
      </RenderIf>
    </div>
  )
}

export default App
