/* global */
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { SolidityCompiler, CompileTab as CompileTabLogic, parseContracts } from '@remix-ui/solidity-compiler' // eslint-disable-line
import { CompilerApiMixin } from '@remixproject/solidity-compiler-plugin'
import { ViewPlugin } from '@remixproject/engine-web'
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
  constructor () {
    super(profile)
    this.initCompilerApi()
  }

  renderComponent () {
    ReactDOM.render(
      <SolidityCompiler plugin={this}/>
      , this.el)
  }

  onCurrentFileChanged () {
    this.renderComponent()
  }

  onResetResults () {
    this.renderComponent()
  }

  setHardHatCompilation (value) {
    this.hhCompilation = value
  }

  setSelectedVersion (version) {
    this.selectedVersion = version
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

  onActivation () {
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
}

module.exports = CompileTab
