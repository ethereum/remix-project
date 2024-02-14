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
import {CustomTooltip} from '@remix-ui/helper'
import {Form} from 'react-bootstrap'
import {CompileErrorCard} from './components/CompileErrorCard'

interface AppState {
  status: 'idle' | 'inProgress'
  environment: 'remote' | 'local'
  compilationResult?: CompilationResult
  localUrl: string
}

interface OutputMap {
  [fileName: string]: any
}

const App = () => {
  const [contract, setContract] = useState<string>()
  const [output, setOutput] = useState<any>(remixClient.compilerOutput)
  const [state, setState] = useState<AppState>({
    status: 'idle',
    environment: 'remote',
    localUrl: 'http://localhost:8000/',
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

  useEffect(() => {
    remixClient.eventEmitter.on('resetCompilerState', () => {
      resetCompilerResultState()
    })

    return () => {
      remixClient.eventEmitter.off('resetCompilerState', () => {
        resetCompilerResultState()
      })
    }
  }, [])

  useEffect(() => {
    remixClient.eventEmitter.on('setOutput', (payload) => {
      if (payload.status === 'failed') {
        console.error('Error in the compiler', payload)
      }
      setOutput(payload)
    })

    return () => {
      remixClient.eventEmitter.off('setOutput', (payload) => {
        setOutput(payload)
      })
    }
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
    setOutput(remixClient.compilerOutput)
  }

  return (
    <main id="vyper-plugin">
      <header>
        <div className="title">
          <img src={'assets/vyperLogo_v2.webp'} alt="Vyper logo" />
          <h4 className="pl-1">yper Compiler</h4>
        </div>
        <a rel="noopener noreferrer" href="https://github.com/ethereum/remix-project/tree/master/apps/vyper" target="_blank">
          <i className="fab fa-github"></i>
        </a>
      </header>
      <section>
        <div className="px-3 pt-3 mb-3 w-100">
          <CustomTooltip placement="bottom" tooltipText="Clone Vyper examples. Switch to the File Explorer to see the examples.">
            <Button data-id="add-repository" className="w-100 btn btn-secondary" onClick={() => remixClient.cloneVyperRepo()}>
              Clone Vyper examples repository
            </Button>
          </CustomTooltip>
        </div>
        <Form>
          <div className="d-flex flex-row gap-5 mb-3 mt-2">
            <Form.Check inline data-id="remote-compiler" type="radio" value={state.environment} checked={state.environment === 'remote'} onChange={() => setEnvironment('remote')} label="Remote Compiler" style={{cursor: state.environment === 'remote' ? 'default' : 'pointer'}} className="d-flex mr-4" />
            <Form.Check inline id="local-compiler" data-id="local-compiler" checked={state.environment === 'local'} type="radio" name="local" value={state.environment} onChange={() => setEnvironment('local')} label="Local Compiler" style={{cursor: state.environment === 'local' ? 'default' : 'pointer'}} />
          </div>
        </Form>
        <span className="px-3 mt-1 mb-1 small text-warning">Specify the compiler version & EVM version in the .vy file</span>
        <LocalUrlInput url={state.localUrl} setUrl={setLocalUrl} environment={state.environment} />
        <div className="px-3 w-100 mb-3 mt-1" id="compile-btn">
          <CompilerButton compilerUrl={compilerUrl()} contract={contract} setOutput={(name, update) => setOutput({...output, [name]: update})} resetCompilerState={resetCompilerResultState} />
        </div>

        <article id="result" className="px-2 mx-2 border-top mt-3">
          {output && Object.keys(output).length > 0 && output.status !== 'failed' ? (
            <>
              <VyperResult output={output} plugin={remixClient} />
            </>
          ) : output.status === 'failed' ? (
            <CompileErrorCard output={output} />
          ) : null}
        </article>
      </section>
    </main>
  )
}

export default App
