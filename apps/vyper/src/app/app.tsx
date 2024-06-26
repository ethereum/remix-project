import { useState, useEffect, useRef } from 'react'

import { remixClient } from './utils'
import { CompilationResult } from '@remixproject/plugin-api'

// Components
import CompilerButton from './components/CompilerButton'
import VyperResult from './components/VyperResult'
import LocalUrlInput from './components/LocalUrl'
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'

import './app.css'
import { CustomTooltip } from '@remix-ui/helper'
import { Form } from 'react-bootstrap'
import { CompileErrorCard } from './components/CompileErrorCard'
import CustomAccordionToggle from './components/CustomAccordionToggle'

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

  const spinnerIcon = useRef(null)

  useEffect(() => {
    async function start() {
      try {
        await remixClient.loaded()
        remixClient.onFileChange((name) => {
          !name.endsWith('.vy') && remixClient.changeStatus({ key: 'none' })
          setOutput({})
          setContract(name)
        })
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
    setState({ ...state, environment })
  }

  function setLocalUrl(url: string) {
    setState({ ...state, localUrl: url })
  }

  function compilerUrl() {
    return state.environment === 'remote' ? 'https://vyper2.remixproject.org/' : state.localUrl
  }

  function resetCompilerResultState() {
    setOutput(remixClient.compilerOutput)
  }

  const startingCompilation = () => {
    if (!spinnerIcon.current) return
    spinnerIcon.current.setAttribute('title', 'compiling...')
    spinnerIcon.current.classList.remove('remixui_bouncingIcon')
    spinnerIcon.current.classList.add('remixui_spinningIcon')
  }

  const [cloneCount, setCloneCount] = useState(0)

  return (
    <main id="vyper-plugin">
      <section>
        <div className="px-3 pt-3 mb-3 w-100">
          <CustomTooltip placement="bottom" tooltipText="Clone a repo of Vyper examples. Switch to the File Explorer to see the examples.">
            <Button data-id="add-repository" className="w-100 btn btn-secondary" onClick={() => {
              {cloneCount === 0 ? remixClient.cloneVyperRepo() : remixClient.cloneVyperRepo(cloneCount)}
              setCloneCount((prev) => {
                return ++prev
              })
            }}>
              Clone a repo of Vyper examples
            </Button>
          </CustomTooltip>
        </div>

        <Accordion className="border-0 w-100 mb-3 accordion-background">
          <div className="border-0">
            <div className="">
              <CustomAccordionToggle eventKey="0">
                <span className="">Advanced Compiler Settings</span>
              </CustomAccordionToggle>
            </div>
            <Accordion.Collapse eventKey="0">
              <div className="pt-2">
                <Form>
                  <div className="d-flex flex-row justify-content-around mb-1 mt-2">
                    <div className={`custom-control custom-radio ${state.environment === 'remote' ? 'd-flex' : 'd-flex cursor-status'}`}>
                      <input type="radio" id="remote-compiler" data-id="remote-compiler" name="remote" value={state.environment} checked={state.environment === 'remote'} onChange={() => setEnvironment('remote')} className={`custom-control-input  ${state.environment === 'remote' ? 'd-flex mr-1' : 'd-flex mr-1 cursor-status'}`} />
                      <label htmlFor="remote-compiler" className="form-check-label custom-control-label">Remote Compiler</label>
                    </div>
                    <div className={`custom-control custom-radio ${state.environment === 'local' ? 'mr-2' : `cursor-status`}`}>
                      <input id="local-compiler" data-id="local-compiler" checked={state.environment === 'local'} type="radio" name="local" value={state.environment} onChange={() => setEnvironment('local')} className={`custom-control-input  ${state.environment === 'local' ? '' : `cursor-status`}`} />
                      <label htmlFor="local-compiler" className="form-check-label custom-control-label">Local Compiler</label>
                    </div>
                  </div>
                </Form>
                <LocalUrlInput url={state.localUrl} setUrl={setLocalUrl} environment={state.environment} />
              </div>
            </Accordion.Collapse>
          </div>
        </Accordion>
        <span className="px-3 mt-3 mb-3 small text-warning">
          Specify the{' '}
          <a className="text-warning" target="_blank" href="https://remix-ide.readthedocs.io/en/latest/vyper.html#specify-vyper-version">
            compiler version
          </a>{' '}
          &{' '}
          <a className="text-warning" href="https://remix-ide.readthedocs.io/en/latest/vyper.html#evm-version" target="_blank" rel="noopener noreferrer">
            EVM version
          </a>{' '}
          in the .vy file.
        </span>
        <div className="px-3 w-100 mb-3 mt-1" id="compile-btn">
          <CompilerButton compilerUrl={compilerUrl()} contract={contract} setOutput={(name, update) => setOutput({ ...output, [name]: update })} resetCompilerState={resetCompilerResultState} output={output} remixClient={remixClient}/>
        </div>

        <article id="result" className="p-2 mx-3 border-top mt-2">
          {output && Object.keys(output).length > 0 && output.status !== 'failed' ? (
            <>
              <VyperResult output={output} plugin={remixClient} />
            </>
          ) : output.status === 'failed' ? (
            <CompileErrorCard output={output} plugin={remixClient} />
          ) : null}
        </article>
      </section>
    </main>
  )
}

export default App
