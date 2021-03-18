import React, { useState, useEffect } from 'react' // eslint-disable-line
import { SolidityCompilerProps } from './types'
import { CompilerContainer } from './compiler-container' // eslint-disable-line
import CompileTabLogic from './compileTabLogic'
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line

import './css/style.css'

export const SolidityCompiler = (props: SolidityCompilerProps) => {
  const { editor, config, fileProvider, fileManager, contentImport, queryParams, plugin } = props
  const [state, setState] = useState({
    contractsDetails: {},
    eventHandlers: {},
    loading: false,
    compileTabLogic: null,
    compiler: null,
    toasterMsg: ''
  })

  useEffect(() => {
    const miscApi = { clearAnnotations }
    const compileTabLogic = new CompileTabLogic(queryParams, fileManager, editor, config, fileProvider, contentImport, miscApi)
    const compiler = compileTabLogic.compiler

    compileTabLogic.init()
    setState(prevState => {
      return { ...prevState, compileTabLogic, compiler }
    })
  }, [])

  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const clearAnnotations = () => {
    plugin.call('editor', 'clearAnnotations')
  }
  // this.onActivationInternal()
  return (
    <>
      <div id="compileTabView">
        <CompilerContainer editor={editor} config={config} queryParams={queryParams} compileTabLogic={state.compileTabLogic} tooltip={toast} />
        {/* ${this._view.contractSelection} */}
        <div className="remixui_errorBlobs p-4" data-id="compiledErrors"></div>
      </div>
      <Toaster message={state.toasterMsg} />
    </>
  )
}

export default SolidityCompiler
