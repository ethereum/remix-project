/* global */
import { ViewPlugin } from '@remixproject/engine-web'
import * as packageJson from '../../../../../package.json'
import publishToStorage from '../../publishToStorage'
import { compile } from '../compiler/compiler-helpers'

const EventEmitter = require('events')
const $ = require('jquery')
const yo = require('yo-yo')
const copy = require('copy-text-to-clipboard')
var QueryParams = require('../../lib/query-params')
const TreeView = require('../ui/TreeView')
const modalDialog = require('../ui/modaldialog')
const copyToClipboard = require('../ui/copy-to-clipboard')
const modalDialogCustom = require('../ui/modal-dialog-custom')
const parseContracts = require('./compileTab/contractParser')
const addTooltip = require('../ui/tooltip')
const Renderer = require('../ui/renderer')
const globalRegistry = require('../../global/registry')

var css = require('./styles/compile-tab-styles')

const CompileTabLogic = require('./compileTab/compileTab.js')
const CompilerContainer = require('./compileTab/compilerContainer.js')

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
  methods: ['getCompilationResult', 'compile', 'compileWithParameters', 'setCompilerConfig']

}

// EditorApi:
// - events: ['compilationFinished'],
// - methods: ['getCompilationResult']

class CompileTab extends ViewPlugin {
  constructor (editor, config, fileProvider, fileManager, contentImport) {
    super(profile)
    this.events = new EventEmitter()
    this._view = {
      el: null,
      warnCompilationSlow: null,
      errorContainer: null,
      contractEl: null
    }
    this.contentImport = contentImport
    this.queryParams = new QueryParams()
    this.fileProvider = fileProvider
    // dependencies
    this.editor = editor
    this.config = config
    this.renderer = new Renderer(this)
    this.fileManager = fileManager

    this.data = {
      contractsDetails: {},
      eventHandlers: {},
      loading: false
    }
  }

  onActivationInternal () {
    const miscApi = {
      clearAnnotations: () => {
        this.call('editor', 'clearAnnotations')
      }
    }
    this.compileTabLogic = new CompileTabLogic(this.queryParams, this.fileManager, this.editor, this.config, this.fileProvider, this.contentImport, miscApi)
    this.compiler = this.compileTabLogic.compiler
    this.compileTabLogic.init()

    this.compilerContainer = new CompilerContainer(
      this.compileTabLogic,
      this.editor,
      this.config,
      this.queryParams
    )
  }

  resetResults () {
    if (this._view.errorContainer) {
      this._view.errorContainer.innerHTML = ''
    }
    this.compilerContainer.currentFile = ''
    this.data.contractsDetails = {}
    yo.update(this._view.contractSelection, this.contractSelection())
  }

  /************
   * EVENTS
   */

  listenToEvents () {
    this.data.eventHandlers.onContentChanged = () => {
      this.emit('statusChanged', { key: 'edited', title: 'the content has changed, needs recompilation', type: 'info' })
    }
    this.editor.event.register('contentChanged', this.data.eventHandlers.onContentChanged)

    this.data.eventHandlers.onLoadingCompiler = () => {
      this.data.loading = true
      this.emit('statusChanged', { key: 'loading', title: 'loading compiler...', type: 'info' })
    }
    this.compiler.event.register('loadingCompiler', this.data.eventHandlers.onLoadingCompiler)

    this.data.eventHandlers.onCompilerLoaded = () => {
      this.data.loading = false
      this.emit('statusChanged', { key: 'none' })
    }
    this.compiler.event.register('compilerLoaded', this.data.eventHandlers.onCompilerLoaded)

    this.data.eventHandlers.onStartingCompilation = () => {
      if (this._view.errorContainer) {
        this._view.errorContainer.innerHTML = ''
      }
      this.emit('statusChanged', { key: 'loading', title: 'compiling...', type: 'info' })
    }

    this.on('filePanel', 'setWorkspace', () => this.resetResults())

    this.compileTabLogic.event.on('startingCompilation', this.data.eventHandlers.onStartingCompilation)

    this.data.eventHandlers.onCurrentFileChanged = (name) => {
      this.compilerContainer.currentFile = name
    }
    this.fileManager.events.on('currentFileChanged', this.data.eventHandlers.onCurrentFileChanged)

    this.data.eventHandlers.onNoFileSelected = () => {
      this.compilerContainer.currentFile = ''
    }
    this.fileManager.events.on('noFileSelected', this.data.eventHandlers.onNoFileSelected)

    this.data.eventHandlers.onCompilationFinished = (success, data, source) => {
      this._view.errorContainer.appendChild(yo`<span data-id="compilationFinishedWith_${this.getCurrentVersion()}"></span>`)
      if (success) {
        // forwarding the event to the appManager infra
        this.emit('compilationFinished', source.target, source, 'soljson', data)
        if (data.errors && data.errors.length > 0) {
          this.emit('statusChanged', {
            key: data.errors.length,
            title: `compilation finished successful with warning${data.errors.length > 1 ? 's' : ''}`,
            type: 'warning'
          })
        } else this.emit('statusChanged', { key: 'succeed', title: 'compilation successful', type: 'success' })
        // Store the contracts
        this.data.contractsDetails = {}
        this.compiler.visitContracts((contract) => {
          this.data.contractsDetails[contract.name] = parseContracts(
            contract.name,
            contract.object,
            this.compiler.getSource(contract.file)
          )
        })
      } else {
        const count = (data.errors ? data.errors.filter(error => error.severity === 'error').length : 0 + data.error ? 1 : 0)
        this.emit('statusChanged', { key: count, title: `compilation failed with ${count} error${count.length > 1 ? 's' : ''}`, type: 'error' })
      }
      // Update contract Selection
      const contractMap = {}
      if (success) this.compiler.visitContracts((contract) => { contractMap[contract.name] = contract })
      const contractSelection = this.contractSelection(contractMap)
      yo.update(this._view.contractSelection, contractSelection)

      if (data.error) {
        this.renderer.error(
          data.error.formattedMessage || data.error,
          this._view.errorContainer,
          { type: data.error.severity || 'error', errorType: data.error.type }
        )
        if (data.error.mode === 'panic') {
          return modalDialogCustom.alert(yo`
            <div><i class="fas fa-exclamation-circle ${css.panicError}" aria-hidden="true"></i>
            The compiler returned with the following internal error: <br> <b>${data.error.formattedMessage}.<br>
            The compiler might be in a non-sane state, please be careful and do not use further compilation data to deploy to mainnet.
            It is heavily recommended to use another browser not affected by this issue (Firefox is known to not be affected).</b><br>
            Please join <a href="https://gitter.im/ethereum/remix" target="blank" >remix gitter channel</a> for more information.</div>`)
        }
      }
      if (data.errors && data.errors.length) {
        data.errors.forEach((err) => {
          if (this.config.get('hideWarnings')) {
            if (err.severity !== 'warning') {
              this.renderer.error(err.formattedMessage, this._view.errorContainer, { type: err.severity, errorType: err.type })
            }
          } else {
            this.renderer.error(err.formattedMessage, this._view.errorContainer, { type: err.severity, errorType: err.type })
          }
        })
      }
    }
    this.compiler.event.register('compilationFinished', this.data.eventHandlers.onCompilationFinished)

    this.data.eventHandlers.onThemeChanged = (theme) => {
      const invert = theme.quality === 'dark' ? 1 : 0
      const img = document.getElementById('swarmLogo')
      if (img) {
        img.style.filter = `invert(${invert})`
      }
    }
    globalRegistry.get('themeModule').api.events.on('themeChanged', this.data.eventHandlers.onThemeChanged)

    // Run the compiler instead of trying to save the website
    $(window).keydown((e) => {
      // ctrl+s or command+s
      if ((e.metaKey || e.ctrlKey) && e.keyCode === 83) {
        e.preventDefault()
        this.compileTabLogic.runCompiler()
      }
    })
  }

  getCompilationResult () {
    return this.compileTabLogic.compiler.state.lastCompilationResult
  }

  /**
   * compile using @arg fileName.
   * The module UI will be updated accordingly to the new compilation result.
   * This function is used by remix-plugin compiler API.
   * @param {string} fileName to compile
   */
  compile (fileName) {
    addTooltip(yo`<div><b>${this.currentRequest.from}</b> is requiring to compile <b>${fileName}</b></div>`)
    return this.compileTabLogic.compileFile(fileName)
  }

  /**
   * compile using @arg compilationTargets and @arg settings
   * The module UI will *not* be updated, the compilation result is returned
   * This function is used by remix-plugin compiler API.
   * @param {object} map of source files.
   * @param {object} settings {evmVersion, optimize, runs, version, language}
   */
  async compileWithParameters (compilationTargets, settings) {
    settings.version = settings.version || this.compilerContainer.data.selectedVersion
    const res = await compile(compilationTargets, settings)
    return res
  }

  // This function is used for passing the compiler remix-tests
  getCurrentVersion () {
    return this.compilerContainer.data.selectedVersion
  }

  // This function is used for passing the compiler configuration to 'remix-tests'
  getCurrentCompilerConfig () {
    return {
      currentVersion: this.compilerContainer.data.selectedVersion,
      evmVersion: this.compileTabLogic.evmVersion,
      optimize: this.compileTabLogic.optimize,
      runs: this.compileTabLogic.runs
    }
  }

  /**
   * set the compiler configuration
   * This function is used by remix-plugin compiler API.
   * @param {object} settings {evmVersion, optimize, runs, version, language}
   */
  setCompilerConfig (settings) {
    return new Promise((resolve, reject) => {
      addTooltip(yo`<div><b>${this.currentRequest.from}</b> is updating the <b>Solidity compiler configuration</b>.<pre class="text-left">${JSON.stringify(settings, null, '\t')}</pre></div>`)
      this.compilerContainer.setConfiguration(settings)
      // @todo(#2875) should use loading compiler return value to check whether the compiler is loaded instead of "setInterval"
      let timeout = 0
      const id = setInterval(() => {
        timeout++
        console.log(this.data.loading)
        if (!this.data.loading || timeout > 10) {
          resolve()
          clearInterval(id)
        }
      }, 200)
    })
  }

  /*********
   * SUB-COMPONENTS
   */

  /**
   * Section to select the compiled contract
   * @param {string[]} contractList Names of the compiled contracts
   */
  contractSelection (contractMap) {
    // Return the file name of a path: ex "browser/ballot.sol" -> "ballot.sol"
    const getFileName = (path) => {
      const part = path.split('/')
      return part[part.length - 1]
    }
    const contractList = contractMap ? Object.keys(contractMap).map((key) => ({
      name: key,
      file: getFileName(contractMap[key].file)
    })) : []
    const selectEl = yo`
      <select
        onchange="${e => this.selectContract(e.target.value)}"
        data-id="compiledContracts" id="compiledContracts" class="custom-select"
      >
        ${contractList.map(({ name, file }) => yo`<option value="${name}">${name} (${file})</option>`)}
      </select>
    `
    // define swarm logo

    const result = contractList.length
      ? yo`<section class="${css.compilerSection} pt-3">
      <!-- Select Compiler Version -->
      <div class="mb-3">
        <label class="${css.compilerLabel} form-check-label" for="compiledContracts">Contract</label>
        ${selectEl}
      </div>
      <article class="mt-2 pb-0">
        <button id="publishOnSwarm" class="btn btn-secondary btn-block" title="Publish on Swarm" onclick="${() => { publishToStorage('swarm', this.fileProvider, this.fileManager, this.data.contractsDetails[this.selectedContract]) }}">
          <span>Publish on Swarm</span>
          <img id="swarmLogo" class="${css.storageLogo} ml-2" src="assets/img/swarm.webp">
        </button>
        <button id="publishOnIpfs" class="btn btn-secondary btn-block" title="Publish on Ipfs" onclick="${() => { publishToStorage('ipfs', this.fileProvider, this.fileManager, this.data.contractsDetails[this.selectedContract]) }}">
        <span>Publish on Ipfs</span>
        <img id="ipfsLogo" class="${css.storageLogo} ml-2" src="assets/img/ipfs.webp">
      </button>
        <button data-id="compilation-details" class="btn btn-secondary btn-block" title="Display Contract Details" onclick="${() => { this.details() }}">
          Compilation Details
        </button>
        <!-- Copy to Clipboard -->
        <div class="${css.contractHelperButtons}">
          <div class="input-group">
            <div class="btn-group" role="group" aria-label="Copy to Clipboard">
              <button class="btn ${css.copyButton}" title="Copy ABI to clipboard" onclick="${() => { this.copyABI() }}">
                <i class="${css.copyIcon} far fa-copy" aria-hidden="true"></i>
                <span>ABI</span>
              </button>
              <button class="btn ${css.copyButton}" title="Copy Bytecode to clipboard" onclick="${() => { this.copyBytecode() }}">
                <i class="${css.copyIcon} far fa-copy" aria-hidden="true"></i>
                <span>Bytecode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>`
      : yo`<section class="${css.container} clearfix"><article class="px-2 mt-2 pb-0 d-flex">
      <span class="mt-2 mx-3 w-100 alert alert-warning" role="alert">No Contract Compiled Yet</span>
    </article></section>`

    if (contractList.length) {
      this.selectedContract = selectEl.value
    } else {
      delete this.selectedContract
    }
    return result
  }

  // TODO : Add success alert when compilation succeed
  contractCompiledSuccess () {
    return yo`<div></div>`
  }

  // TODO : Add error alert when compilation failed
  contractCompiledError () {
    return yo`<div></div>`
  }

  /************
   * METHODS
   */

  selectContract (contractName) {
    this.selectedContract = contractName
  }

  details () {
    const help = {
      Assembly: 'Assembly opcodes describing the contract including corresponding solidity source code',
      Opcodes: 'Assembly opcodes describing the contract',
      'Runtime Bytecode': 'Bytecode storing the state and being executed during normal contract call',
      bytecode: 'Bytecode being executed during contract creation',
      functionHashes: 'List of declared function and their corresponding hash',
      gasEstimates: 'Gas estimation for each function call',
      metadata: 'Contains all informations related to the compilation',
      metadataHash: 'Hash representing all metadata information',
      abi: 'ABI: describing all the functions (input/output params, scope, ...)',
      name: 'Name of the compiled contract',
      swarmLocation: 'Swarm url where all metadata information can be found (contract needs to be published first)',
      web3Deploy: 'Copy/paste this code to any JavaScript/Web3 console to deploy this contract'
    }
    if (!this.selectedContract) throw new Error('No contract compiled yet')
    const contractProperties = this.data.contractsDetails[this.selectedContract]
    const log = yo`<div class="${css.detailsJSON}"></div>`
    Object.keys(contractProperties).map(propertyName => {
      const copyDetails = yo`<span class="${css.copyDetails}">${copyToClipboard(() => contractProperties[propertyName])}</span>`
      const questionMark = yo`<span class="${css.questionMark}"><i title="${help[propertyName]}" class="fas fa-question-circle" aria-hidden="true"></i></span>`
      log.appendChild(yo`<div class=${css.log}>
        <div class="${css.key}">${propertyName} ${copyDetails} ${questionMark}</div>
        ${this.insertValue(contractProperties, propertyName)}
      </div>`)
    })
    modalDialog(this.selectedContract, log, { label: '' }, { label: 'Close' })
  }

  insertValue (details, propertyName) {
    var node
    if (propertyName === 'web3Deploy' || propertyName === 'name' || propertyName === 'Assembly') {
      node = yo`<pre>${details[propertyName]}</pre>`
    } else if (propertyName === 'abi' || propertyName === 'metadata') {
      const treeView = new TreeView({
        extractData: function (item, parent, key) {
          var ret = {}
          if (item instanceof Array) {
            ret.children = item.map((item, index) => ({ key: index, value: item }))
            ret.self = ''
          } else if (item instanceof Object) {
            ret.children = Object.keys(item).map((key) => ({ key: key, value: item[key] }))
            ret.self = ''
          } else {
            ret.self = item
            ret.children = []
          }
          return ret
        }
      })
      if (details[propertyName] !== '') {
        try {
          node = yo`
          <div>
            ${treeView.render(typeof details[propertyName] === 'object' ? details[propertyName] : JSON.parse(details[propertyName]))}
          </div>` // catch in case the parsing fails.
        } catch (e) {
          node = yo`<div>Unable to display "${propertyName}": ${e.message}</div>`
        }
      } else {
        node = yo`<div> - </div>`
      }
    } else {
      node = yo`<div>${JSON.stringify(details[propertyName], null, 4)}</div>`
    }
    return yo`<pre class="${css.value}">${node || ''}</pre>`
  }

  getContractProperty (property) {
    if (!this.selectedContract) throw new Error('No contract compiled yet')
    const contractProperties = this.data.contractsDetails[this.selectedContract]
    return contractProperties[property] || null
  }

  copyContractProperty (property) {
    let content = this.getContractProperty(property)
    if (!content) {
      addTooltip('No content available for ' + property)
      return
    }

    try {
      if (typeof content !== 'string') {
        content = JSON.stringify(content, null, '\t')
      }
    } catch (e) {}

    copy(content)
    addTooltip('Copied value to clipboard')
  }

  copyABI () {
    this.copyContractProperty('abi')
  }

  copyBytecode () {
    this.copyContractProperty('bytecode')
  }

  render () {
    if (this._view.el) return this._view.el
    this.onActivationInternal()
    this._view.errorContainer = yo`<div class="${css.errorBlobs} p-4" data-id="compiledErrors" ></div>`
    this._view.contractSelection = this.contractSelection()
    this._view.compilerContainer = this.compilerContainer.render()
    this.compilerContainer.activate()
    this._view.el = yo`
      <div id="compileTabView">
        ${this._view.compilerContainer}
        ${this._view.contractSelection}
        ${this._view.errorContainer}
      </div>`
    return this._view.el
  }

  onActivation () {
    this.listenToEvents()
  }

  onDeactivation () {
    this.compilerContainer.deactivate()
    this.editor.event.unregister('contentChanged', this.data.eventHandlers.onContentChanged)
    this.compiler.event.unregister('loadingCompiler', this.data.eventHandlers.onLoadingCompiler)
    this.compiler.event.unregister('compilerLoaded', this.data.eventHandlers.onCompilerLoaded)
    this.compileTabLogic.event.removeListener('startingCompilation', this.data.eventHandlers.onStartingCompilation)
    this.fileManager.events.removeListener('currentFileChanged', this.data.eventHandlers.onCurrentFileChanged)
    this.fileManager.events.removeListener('noFileSelected', this.data.eventHandlers.onNoFileSelected)
    this.compiler.event.unregister('compilationFinished', this.data.eventHandlers.onCompilationFinished)
    globalRegistry.get('themeModule').api.events.removeListener('themeChanged', this.data.eventHandlers.onThemeChanged)
  }
}

module.exports = CompileTab
