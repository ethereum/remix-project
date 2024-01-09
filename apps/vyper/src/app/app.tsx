import React, {useState, useEffect} from 'react'

import {remixClient} from './utils'
import {CompilationResult} from '@remixproject/plugin-api'

// Components
import CompilerButton from './components/CompilerButton'
import WarnRemote from './components/WarnRemote'
import VyperResult from './components/VyperResult'
import LocalUrlInput from './components/LocalUrl'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from 'react-bootstrap/Button'

import './app.css'
import { CustomTooltip } from '@remix-ui/helper'

interface AppState {
  status: 'idle' | 'inProgress'
  environment: 'remote' | 'local'
  compilationResult?: CompilationResult
  localUrl: string
}

interface OutputMap {
  [fileName: string]: any
}

const App: React.FC = () => {
  const [contract, setContract] = useState<string>()
  const [output, setOutput] = useState<any>({})
  const [state, setState] = useState<AppState>({
    status: 'idle',
    environment: 'remote',
    localUrl: 'http://localhost:8000/'
  })


  useEffect(() => {
    async function start() {
      try {
        await remixClient.loaded()
        remixClient.onFileChange((name) => setContract(name))
        remixClient.onNoFileSelected(() => setContract(''))
      } catch (err) {
        console.log(err)
      }
      try {
        const name = await remixClient.getContractName() // throw if no file are selected
        setContract(name)
      } catch (e) {}
    }
    start()
  }, [])

  /** Update the environment state value */
  function setEnvironment(environment: 'local' | 'remote') {
    setState({...state, environment})
  }

  function setLocalUrl(url: string) {
    setState({...state, localUrl: url})
  }

  function compilerUrl() {
    return state.environment === 'remote' ? 'https://vyper2.remixproject.org/' : state.localUrl
  }

  function resetCompilerResultState() {
    setOutput({})
  }

  return (
    <main id="vyper-plugin">
      <section>
        <div className="px-3 pt-3 mb-3 w-100">
          <CustomTooltip
            placement="bottom"
            tooltipText="Clone Vyper examples. Switch to the File Explorer to see the examples."
          >
            <Button data-id="add-repository" className="w-100 text-dark bg-light btn-outline-primary " onClick={() => remixClient.cloneVyperRepo()}>
            Clone Vyper examples repository
            </Button>
          </CustomTooltip>
        </div>
        <ToggleButtonGroup name="remote" className="mb-3" onChange={setEnvironment} type="radio" value={state.environment}>
          <ToggleButton data-id="remote-compiler" variant="secondary" name="remote" value="remote">
            Remote Compiler v0.3.10
          </ToggleButton>
          <ToggleButton data-id="local-compiler" variant="secondary" name="local" value="local">
            Local Compiler
          </ToggleButton>
        </ToggleButtonGroup>
        <LocalUrlInput url={state.localUrl} setUrl={setLocalUrl} environment={state.environment} />
        <div className="px-3 w-100 mb-3 mt-1" id="compile-btn">
          <CompilerButton
            compilerUrl={compilerUrl()}
            contract={contract}
            setOutput={(name, update) => setOutput({...output, [name]: update})}
            resetCompilerState={resetCompilerResultState}
          />
        </div>

        <article id="result" className="px-2 mx-2 border-top mt-3">
          {
            output && Object.keys(output).length > 0 && output.status !== 'failed' ? (
              <>
                <VyperResult output={output} plugin={remixClient} />
              </>
            ) : null
          }
        </article>
      </section>
    </main>
  )
}

export default App
