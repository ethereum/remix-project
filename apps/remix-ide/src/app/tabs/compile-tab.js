/* global */
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { SolidityCompiler } from '@remix-ui/solidity-compiler' // eslint-disable-line
import { CompileTabLogic } from '@remix-ui/solidity-compiler' // eslint-disable-line
import { CompilerApiMixin } from '@remixproject/solidity-compiler-plugin'
import { ViewPlugin } from '@remixproject/engine-web'
import QueryParams from '../../lib/query-params'
// import { ICompilerApi } from '@remix-project/remix-lib-ts'
import * as packageJson from '../../../../../package.json'

const yo = require('yo-yo')
const addTooltip = require('../ui/tooltip')

const css = require('./styles/compile-tab-styles')

const profile = {
  name: 'solidity',
  displayName: 'Solidity compiler',
  icon: 'assets/img/solidity.webp',
  description: 'Compile solidity contracts',
  kind: 'compiler',
  permission: true,
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/solidity_editor.html',
  version: packageJson.version,
  methods: ['getCompilationResult', 'compile', 'compileWithParameters', 'setCompilerConfig', 'compileFile', 'getCompilerState']
}

// EditorApi:
// - events: ['compilationFinished'],
// - methods: ['getCompilationResult']

class CompileTab extends CompilerApiMixin(ViewPlugin) { // implements ICompilerApi
  constructor (config, fileManager) {
    super(profile)
    this.fileManager = fileManager
    this.config = config
    this.queryParams = new QueryParams()
    this.compileTabLogic = new CompileTabLogic(this, this.contentImport)
    this.compiler = this.compileTabLogic.compiler
    this.compileTabLogic.init()
    this.initCompilerApi()
  }

  renderComponent () {
    ReactDOM.render(
      <SolidityCompiler api={this}/>
      , this.el)
  }

  onCurrentFileChanged () {
    this.renderComponent()
  }

  onResetResults () {
    this.renderComponent()
  }

  onSetWorkspace () {
    this.renderComponent()
  }

  onNoFileSelected () {
    this.renderComponent()
  }

  onCompilationFinished () {
    this.renderComponent()
  }

  render () {
    if (this.el) return this.el
    this.el = yo`
      <div class="${css.debuggerTabView}" id="compileTabView">
        <div id="compiler" class="${css.compiler}"></div>
      </div>`
    this.renderComponent()

    return this.el
  }

  async compileWithParameters (compilationTargets, settings) {
    return await super.compileWithParameters(compilationTargets, settings)
  }

  getCompilationResult () {
    return super.getCompilationResult()
  }

  getFileManagerMode () {
    return this.fileManager.mode
  }

  /**
   * set the compiler configuration
   * This function is used by remix-plugin compiler API.
   * @param {object} settings {evmVersion, optimize, runs, version, language}
   */
  setCompilerConfig (settings) {
    super.setCompilerConfig(settings)
    this.renderComponent()
    // @todo(#2875) should use loading compiler return value to check whether the compiler is loaded instead of "setInterval"
    addTooltip(yo`<div><b>${this.currentRequest.from}</b> is updating the <b>Solidity compiler configuration</b>.<pre class="text-left">${JSON.stringify(settings, null, '\t')}</pre></div>`)
  }

  compile (fileName) {
    addTooltip(yo`<div><b>${this.currentRequest.from}</b> is requiring to compile <b>${fileName}</b></div>`)
    super.compile(fileName)
  }

  compileFile (event) {
    return super.compileFile(event)
  }

  async onActivation () {
    this.currentFile = await this.call('fileManager', 'file')
    super.onActivation()    
    this.call('filePanel', 'registerContextMenuItem', {
      id: 'solidity',
      name: 'compileFile',
      label: 'Compile',
      type: [],
      extension: ['.sol'],
      path: [],
      pattern: []
    })
  }

  getCompilerParameters () {
    const params = this.queryParams.get()
    params.optimize = (params.optimize === 'false' || params.optimize === null || params.optimize === undefined) ? false : params.optimize
    params.optimize = params.optimize === 'true' ? true : params.optimize
    return params
  }

  setCompilerParameters (params) {
    this.queryParams.update(params)
  }

  getAppParameter (name) {
    const param = this.config.get(name)
    if (param === 'true') return true
    if (param === 'false') return false
    return param
  }

  setAppParameter (name, value) {
    this.config.set(name, value)
  }
}

module.exports = CompileTab
