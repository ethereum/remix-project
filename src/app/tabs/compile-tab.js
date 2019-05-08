/* global */
const EventEmitter = require('events')
const $ = require('jquery')
const yo = require('yo-yo')
const copy = require('copy-text-to-clipboard')
var QueryParams = require('../../lib/query-params')
const TreeView = require('../ui/TreeView')
const modalDialog = require('../ui/modaldialog')
const copyToClipboard = require('../ui/copy-to-clipboard')
const modalDialogCustom = require('../ui/modal-dialog-custom')
const parseContracts = require('../contract/contractParser')
const publishOnSwarm = require('../contract/publishOnSwarm')
const addTooltip = require('../ui/tooltip')

var css = require('./styles/compile-tab-styles')

const CompileTabLogic = require('./compileTab/compileTab.js')
const CompilerContainer = require('./compileTab/compilerContainer.js')

import { CompilerApi } from 'remix-plugin'

const profile = {
  name: 'solidity',
  displayName: 'Solidity compiler',
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAASdAAAEnQF8NGuhAAAAB3RJTUUH4wQMDx84DVYryQAAAjBJREFUSMe1102ITmEUB/DfO4aZRuM7otQgqSlCFmIhSRaSJClWs9BY2RAba1tLZTGxmbJWImFsWBhhZONzpJSEaJhhPl6bM/V2ux/vnTtz6untPvc857z/8/E/z61pXnZjHeoFejcwUWSs1qTTFjzHOP7l2PqCAVxuxmAzcgbLsSQH8SQ+YxM6igzOa8LpMvSH4dYI43iK3nDs17AND6oiPt+Qs3qgTso4fjU8r0Z3Fcfd6E0505nYe52olyn0VAn1FaxM2W/HSETgN76l6HREet6URbwPe3LeLw5k73OK7UDZdmrBIJYWROse3hak8gluJ1+0ZhyYwlNsLyCMHjOUvFCfij+Q19vmwjFcy9D5gUdVHDdDmY8xP3HmULDUnCGGswmnL3Oc7sBxsygDUeVDaMvR68fDnKItPSROBNo+/M3QOYwtwWq9s4n6ajBWltyJqAziVQbjlZpO03IzZ8CfDpab7vmJGKP3q14E8mQR7qaAaMdJvKiS4zw5lxG5MVyoWlxZshFHI8RpazP2lgl1DRdjAmVxdR070VVAUIM4Uqa4PuFg6LSlrFVRQJ3hIG2NY1fZUH/Asxy0a+L3a07H9M20nYZjmE8mnK5omNWTWJgCYhTHZup4BAuwPjHDNyT0/iTuYbXo7XdVqvpWA/fWI7dpF4exhufvwWSVmGv66ro10HdlVPpokEkd+/FzNobEQKBY23AuuWpx4xzCxyKDrSXI4nrkPO+DrA2XmjH2H8KUd4MWwdIJAAAAAElFTkSuQmCC',
  description: 'Compile solidity contracts',
  kind: 'compile',
  permission: true,
  location: 'swapPanel'
}

// EditorApi:
// - events: ['compilationFinished'],
// - methods: ['getCompilationResult']

class CompileTab extends CompilerApi {

  constructor (editor, config, renderer, swarmfileProvider, fileManager, fileProviders, pluginManager) {
    super(profile)
    this.events = new EventEmitter()
    this._view = {
      el: null,
      warnCompilationSlow: null,
      errorContainer: null,
      contractEl: null
    }
    this.queryParams = new QueryParams()

    // dependencies
    this.editor = editor
    this.config = config
    this.renderer = renderer
    this.swarmfileProvider = swarmfileProvider
    this.fileManager = fileManager
    this.fileProviders = fileProviders
    this.pluginManager = pluginManager

    this.data = {
      contractsDetails: {}
    }

    this.compileTabLogic = new CompileTabLogic(this.queryParams, this.fileManager, this.editor, this.config, this.fileProviders)
    this.compiler = this.compileTabLogic.compiler
    this.compileTabLogic.init()

    this.compilerContainer = new CompilerContainer(
      this.compileTabLogic,
      this.editor,
      this.config,
      this.queryParams
    )
  }

  /************
   * EVENTS
   */

  listenToEvents () {
    let onContentChanged = () => {
      this.events.emit('statusChanged', {key: 'edited', title: 'the content has changed, needs recompilation', type: 'info'})
    }
    this.editor.event.register('contentChanged', onContentChanged)
    this.editor.event.register('sessionSwitched', onContentChanged)

    this.compiler.event.register('loadingCompiler', () => {
      this.events.emit('statusChanged', {key: 'loading', title: 'loading compiler...', type: 'info'})
    })

    this.compiler.event.register('compilerLoaded', () => {
      this.events.emit('statusChanged', {key: 'none'})
    })

    this.compileTabLogic.event.on('startingCompilation', () => {
      if (this._view.errorContainer) {
        this._view.errorContainer.innerHTML = ''
      }
      this.events.emit('statusChanged', {key: 'loading', title: 'compiling...', type: 'info'})
    })

    this.fileManager.events.on('currentFileChanged', (name) => {
      this.compilerContainer.currentFile = name
      cleanupErrors()
      onContentChanged()
    })

    this.fileManager.events.on('noFileSelected', () => {
      this.compilerContainer.currentFile = ''
      cleanupErrors()
    })

    const cleanupErrors = () => {
      this._view.errorContainer.innerHTML = ''
      this.events.emit('statusChanged', {key: 'none'})
    }

    this.compiler.event.register('compilationFinished', (success, data, source) => {
      if (success) {
        // forwarding the event to the appManager infra
        this.events.emit('compilationFinished', source.target, source, 'soljson', data)
        if (data.errors) {
          this.events.emit('statusChanged', {
            key: data.errors.length,
            title: `compilation finished successful with warning${data.errors.length > 1 ? 's' : ''}`,
            type: 'warning'
          })
        } else this.events.emit('statusChanged', {key: 'succeed', title: 'compilation successful', type: 'success'})
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
        this.events.emit('statusChanged', {key: count, title: 'compilation failed', type: 'error'})
      }
      // Update contract Selection
      let contractMap = {}
      if (success) this.compiler.visitContracts((contract) => { contractMap[contract.name] = contract })
      let contractSelection = this.contractSelection(Object.keys(contractMap) || [])
      yo.update(this._view.contractSelection, contractSelection)

      if (data['error']) {
        this.renderer.error(data['error'].formattedMessage, this._view.errorContainer, {type: data['error'].severity || 'error'})
        if (data['error'].mode === 'panic') {
          return modalDialogCustom.alert(yo`
            <div><i class="fas fa-exclamation-circle ${css.panicError}" aria-hidden="true"></i>
            The compiler returned with the following internal error: <br> <b>${data['error'].formattedMessage}.<br>
            The compiler might be in a non-sane state, please be careful and do not use further compilation data to deploy to mainnet.
            It is heavily recommended to use another browser not affected by this issue (Firefox is known to not be affected).</b><br>
            Please join <a href="https://gitter.im/ethereum/remix" target="blank" >remix gitter channel</a> for more information.</div>`)
        }
      }
      if (data.errors && data.errors.length) {
        data.errors.forEach((err) => {
          if (this.config.get('hideWarnings')) {
            if (err.severity !== 'warning') {
              this.renderer.error(err.formattedMessage, this._view.errorContainer, {type: err.severity})
            }
          } else {
            this.renderer.error(err.formattedMessage, this._view.errorContainer, {type: err.severity})
          }
        })
      }
    })

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
    return this.compileTabLogic.compiler.lastCompilationResult
  }

  /*********
   * SUB-COMPONENTS
   */

  /**
   * Section to select the compiled contract
   * @param {string[]} contractList Names of the compiled contracts
   */
  contractSelection (contractList = []) {
    return contractList.length !== 0
    ? yo`<section class="${css.container} clearfix">
      <!-- Select Compiler Version -->
      <header class="navbar navbar-light bg-light input-group mb-3 ${css.compilerArticle}">
        <div class="input-group-prepend">
          <label class="border-0 input-group-text" for="compiledContracts">Contract</label>
        </div>
        <select onchange="${e => this.selectContract(e.target.value)}" onload="${e => { this.selectedContract = e.value }}" id="compiledContracts" class="custom-select">
          ${contractList.map((name) => yo`<option value="${name}">${name}</option>`)}
        </select>
      </header>
      <article class="${css.compilerArticle}">
        <button class="btn btn-primary btn-block" title="Publish on Swarm" onclick="${() => { this.publish() }}">
          <i class="${css.copyIcon} fas fa-upload" aria-hidden="true"></i>
          <span>Publish on Swarm</span>
        </button>
        <button class="btn btn-secondary btn-block" title="Display Contract Details" onclick="${() => { this.details() }}">
          Compilation Details
        </button>
        <!-- Copy to Clipboard -->
        <div class="${css.contractHelperButtons} btn-secondary">
          <div class="input-group">
            <div class="btn-group" role="group" aria-label="Copy to Clipboard">
              <button class="btn btn-secondary" title="Copy ABI to clipboard" onclick="${() => { this.copyABI() }}">
                <i class="${css.copyIcon} far fa-clipboard" aria-hidden="true"></i>
                <span>ABI</span>
              </button>
              <button class="btn btn-secondary" title="Copy Bytecode to clipboard" onclick="${() => { this.copyBytecode() }}">
                <i class="${css.copyIcon} far fa-clipboard" aria-hidden="true"></i>
                <span>Bytecode</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>`
    : yo`<section class="${css.container} clearfix"><article class="${css.compilerArticle}">
      <span class="alert alert-warning" role="alert">No Contract Compiled Yet</span>
    </article></section>`
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

  publish () {
    if (this.selectedContract) {
      var contract = this.data.contractsDetails[this.selectedContract]
      if (contract.metadata === undefined || contract.metadata.length === 0) {
        modalDialogCustom.alert('This contract may be abstract, may not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.')
      } else {
        publishOnSwarm(contract, this.fileManager, function (err, uploaded) {
          if (err) {
            try {
              err = JSON.stringify(err)
            } catch (e) {}
            modalDialogCustom.alert(yo`<span>Failed to publish metadata file to swarm, please check the Swarm gateways is available ( swarm-gateways.net ).<br />
            ${err}</span>`)
          } else {
            var result = yo`<div>${uploaded.map((value) => {
              return yo`<div><b>${value.filename}</b> : <pre>${value.output.url}</pre></div>`
            })}</div>`
            modalDialogCustom.alert(yo`<span>Metadata published successfully.<br> <pre>${result}</pre> </span>`)
          }
        }, (item) => { // triggered each time there's a new verified publish (means hash correspond)
          this.swarmfileProvider.addReadOnly(item.hash, item.content)
        })
      }
    }
  }

  details () {
    const help = {
      'Assembly': 'Assembly opcodes describing the contract including corresponding solidity source code',
      'Opcodes': 'Assembly opcodes describing the contract',
      'Runtime Bytecode': 'Bytecode storing the state and being executed during normal contract call',
      'bytecode': 'Bytecode being executed during contract creation',
      'functionHashes': 'List of declared function and their corresponding hash',
      'gasEstimates': 'Gas estimation for each function call',
      'metadata': 'Contains all informations related to the compilation',
      'metadataHash': 'Hash representing all metadata information',
      'abi': 'ABI: describing all the functions (input/output params, scope, ...)',
      'name': 'Name of the compiled contract',
      'swarmLocation': 'Swarm url where all metadata information can be found (contract needs to be published first)',
      'web3Deploy': 'Copy/paste this code to any JavaScript/Web3 console to deploy this contract'
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
            ret.children = Object.keys(item).map((key) => ({key: key, value: item[key]}))
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
    this.listenToEvents()
    this.compilerContainer.activate()

    this._view.errorContainer = yo`<div class="${css.errorBlobs}"></div>`
    this._view.contractSelection = this.contractSelection()
    this._view.compilerContainer = this.compilerContainer.render()

    this._view.el = yo`
      <div id="compileTabView">
        ${this._view.compilerContainer}
        ${this._view.contractSelection}
        ${this._view.errorContainer}
      </div>`
    return this._view.el
  }

}

module.exports = CompileTab
