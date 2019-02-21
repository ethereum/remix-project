/* global */
const EventEmitter = require('events')
const $ = require('jquery')
const yo = require('yo-yo')
const copy = require('clipboard-copy')
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

class CompileTab {

  constructor (registry) {
    const self = this
    self.event = new EventEmitter()
    self._view = {
      el: null,
      warnCompilationSlow: null,
      errorContainer: null,
      errorContainerHead: null,
      contractNames: null,
      contractEl: null
    }
    self.queryParams = new QueryParams()

    // dependencies
    self._deps = {
      editor: registry.get('editor').api,
      config: registry.get('config').api,
      renderer: registry.get('renderer').api,
      swarmfileProvider: registry.get('fileproviders/swarm').api,
      fileManager: registry.get('filemanager').api,
      fileProviders: registry.get('fileproviders').api,
      pluginManager: registry.get('pluginmanager').api
    }
    self.data = {
      contractsDetails: {}
    }

    this.compileTabLogic = new CompileTabLogic(self.queryParams, self._deps.fileManager, self._deps.editor, self._deps.config, self._deps.fileProviders)
    this.compiler = this.compileTabLogic.compiler
    this.compileTabLogic.init()

    this.compilerContainer = new CompilerContainer(self.compileTabLogic, self._deps.editor, self._deps.config, self.queryParams)

    this.listenToEvents()
  }

  listenToEvents () {
    const self = this

    self.compiler.event.register('compilationStarted', () => {
      if (self._view.errorContainer) {
        self._view.errorContainer.innerHTML = ''
        self._view.errorContainerHead.innerHTML = ''
      }
    })
    self.compiler.event.register('compilationFinished', (success, data, source) => {
      if (success) {
        // forwarding the event to the appManager infra
        self.event.emit('compilationFinished', source.target, source, self.data.selectedVersion, data)
      }
      // reset the contractMetadata list (used by the publish action)
      self.data.contractsDetails = {}
      // refill the dropdown list
      self._view.contractNames.innerHTML = ''
      if (success) {
        // TODO consider using compile tab as a proper module instead of just forwarding event
        self._view.contractNames.removeAttribute('disabled')
        self.compiler.visitContracts(contract => {
          self.data.contractsDetails[contract.name] = parseContracts(contract.name, contract.object, self.compiler.getSource(contract.file))
          var contractName = yo`<option>${contract.name}</option>`
          self._view.contractNames.appendChild(contractName)
        })
      } else {
        self._view.contractNames.setAttribute('disabled', true)
      }
      var error = false
      if (data['error']) {
        error = true
        self._deps.renderer.error(data['error'].formattedMessage, self._view.errorContainer, {type: data['error'].severity || 'error'})
        if (data['error'].mode === 'panic') {
          return modalDialogCustom.alert(yo`<div><i class="fa fa-exclamation-circle ${css.panicError}" aria-hidden="true"></i>
                                            The compiler returned with the following internal error: <br> <b>${data['error'].formattedMessage}.<br>
                                            The compiler might be in a non-sane state, please be careful and do not use further compilation data to deploy to mainnet.
                                            It is heavily recommended to use another browser not affected by this issue (Firefox is known to not be affected).</b><br>
                                            Please join <a href="https://gitter.im/ethereum/remix" target="blank" >remix gitter channel</a> for more information.</div>`)
        }
      }
      if (data.errors && data.errors.length) {
        error = true
        data.errors.forEach((err) => {
          if (self._deps.config.get('hideWarnings')) {
            if (err.severity !== 'warning') {
              self._deps.renderer.error(err.formattedMessage, self._view.errorContainer, {type: err.severity})
            }
          } else {
            self._deps.renderer.error(err.formattedMessage, self._view.errorContainer, {type: err.severity})
          }
        })
      }
      if (!error && data.contracts) {
        self.compiler.visitContracts((contract) => {
          self._deps.renderer.error(contract.name, self._view.errorContainer, {type: 'success'})
        })
      }
    })

    // Run the compiler instead of trying to save the website
    $(window).keydown((e) => {
      // ctrl+s or command+s
      if ((e.metaKey || e.ctrlKey) && e.keyCode === 83) {
        e.preventDefault()
        self.compileTabLogic.runCompiler()
      }
    })
  }

  profile () {
    return {
      name: 'solidity',
      methods: ['getCompilationResult'],
      events: ['compilationFinished'],
      icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE2LjAuMywgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIgoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMTMwMHB4IiBoZWlnaHQ9IjEzMDBweCIKCSB2aWV3Qm94PSIwIDAgMTMwMCAxMzAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMzAwIDEzMDAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8dGl0bGU+VmVjdG9yIDE8L3RpdGxlPgo8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KPGcgaWQ9IlBhZ2UtMSIgc2tldGNoOnR5cGU9Ik1TUGFnZSI+Cgk8ZyBpZD0ic29saWRpdHkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQwMi4wMDAwMDAsIDExOC4wMDAwMDApIiBza2V0Y2g6dHlwZT0iTVNMYXllckdyb3VwIj4KCQk8ZyBpZD0iR3JvdXAiIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiPgoJCQk8cGF0aCBpZD0iU2hhcGUiIG9wYWNpdHk9IjAuNDUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgICAgIiBkPSJNMzcxLjc3MiwxMzUuMzA4TDI0MS4wNjgsMzY3LjYxSC0yMC4xNThsMTMwLjYxNC0yMzIuMzAyCgkJCQlIMzcxLjc3MiIvPgoJCQk8cGF0aCBpZD0iU2hhcGVfMV8iIG9wYWNpdHk9IjAuNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAgICAiIGQ9Ik0yNDEuMDY4LDM2Ny42MWgyNjEuMzE4TDM3MS43NzIsMTM1LjMwOEgxMTAuNDU2CgkJCQlMMjQxLjA2OCwzNjcuNjF6Ii8+CgkJCTxwYXRoIGlkPSJTaGFwZV8yXyIgb3BhY2l0eT0iMC44IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3ICAgICIgZD0iTTExMC40NTYsNTk5LjgyMkwyNDEuMDY4LDM2Ny42MUwxMTAuNDU2LDEzNS4zMDgKCQkJCUwtMjAuMTU4LDM2Ny42MUwxMTAuNDU2LDU5OS44MjJ6Ii8+CgkJCTxwYXRoIGlkPSJTaGFwZV8zXyIgb3BhY2l0eT0iMC40NSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAgICAiIGQ9Ik0xMTEuNzIxLDk0OC4yNzVsMTMwLjcwNC0yMzIuMzAzaDI2MS4zMThMMzczLjAzOCw5NDguMjc1CgkJCQlIMTExLjcyMSIvPgoJCQk8cGF0aCBpZD0iU2hhcGVfNF8iIG9wYWNpdHk9IjAuNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAgICAiIGQ9Ik0yNDIuNDI0LDcxNS45NzNILTE4Ljg5M2wxMzAuNjEzLDIzMi4zMDNoMjYxLjMxNwoJCQkJTDI0Mi40MjQsNzE1Ljk3M3oiLz4KCQkJPHBhdGggaWQ9IlNoYXBlXzVfIiBvcGFjaXR5PSIwLjgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgICAgIiBkPSJNMzczLjAzOCw0ODMuNzYxTDI0Mi40MjQsNzE1Ljk3M2wxMzAuNjE0LDIzMi4zMDMKCQkJCWwxMzAuNzA0LTIzMi4zMDNMMzczLjAzOCw0ODMuNzYxeiIvPgoJCTwvZz4KCTwvZz4KPC9nPgo8L3N2Zz4K',
      description: 'compile solidity contracts',
      kind: 'compile'
    }
  }

  render () {
    const self = this
    if (self._view.el) return self._view.el

    self._view.errorContainer = yo`<div class='error'></div>`
    self._view.errorContainerHead = yo`<div class='error'></div>`
    self._view.contractNames = yo`<select class="${css.contractNames}" disabled></select>`
    self._view.contractEl = yo`
      <div class="${css.container}">
        <div class="${css.contractContainer}">
          ${self._view.contractNames}
          <div title="Publish on Swarm" class="${css.publish}" onclick=${publish}>
            <i class="${css.copyIcon} fa fa-upload" aria-hidden="true"></i><span>Swarm</span>
          </div>
        </div>
        <div class="${css.contractHelperButtons}">
          <div title="Display Contract Details" class="${css.details}" onclick=${details}>Details</div>
          <div title="Copy ABI to clipboard" class="${css.copyButton}" onclick=${copyABI}>
            <i class="${css.copyIcon} fa fa-clipboard" aria-hidden="true"></i> ABI
          </div>
          <div title="Copy Bytecode to clipboard" class="${css.copyButton} ${css.bytecodeButton}" onclick=${copyBytecode}>
            <i class="${css.copyIcon} fa fa-clipboard" aria-hidden="true"></i> Bytecode
          </div>
        </div>
      </div>`
    self._view.el = yo`
      <div class="${css.compileTabView}" id="compileTabView">
        ${this.compilerContainer.render()}
        ${self._view.contractEl}
        ${self._view.errorContainerHead}
        ${self._view.errorContainer}
      </div>`
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
    function getContractProperty (property) {
      const select = self._view.contractNames
      if (select.children.length > 0 && select.selectedIndex >= 0) {
        const contractName = select.children[select.selectedIndex].innerHTML
        const contractProperties = self.data.contractsDetails[contractName]
        return contractProperties[property] || null
      }
    }
    function copyContractProperty (property) {
      let content = getContractProperty(property)
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
    function copyABI () {
      copyContractProperty('abi')
    }
    function copyBytecode () {
      copyContractProperty('bytecode')
    }
    function details () {
      const select = self._view.contractNames
      if (select.children.length > 0 && select.selectedIndex >= 0) {
        const contractName = select.children[select.selectedIndex].innerHTML
        const contractProperties = self.data.contractsDetails[contractName]
        const log = yo`<div class="${css.detailsJSON}"></div>`
        Object.keys(contractProperties).map(propertyName => {
          const copyDetails = yo`<span class="${css.copyDetails}">${copyToClipboard(() => contractProperties[propertyName])}</span>`
          const questionMark = yo`<span class="${css.questionMark}"><i title="${help[propertyName]}" class="fa fa-question-circle" aria-hidden="true"></i></span>`
          log.appendChild(yo`<div class=${css.log}>
            <div class="${css.key}">${propertyName} ${copyDetails} ${questionMark}</div>
            ${insertValue(contractProperties, propertyName)}
          </div>`)
        })
        modalDialog(contractName, log, { label: '' }, { label: 'Close' })
      }
    }
    function insertValue (details, propertyName) {
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
            node = yo`<div>${treeView.render(typeof details[propertyName] === 'object' ? details[propertyName] : JSON.parse(details[propertyName]))}</div>` // catch in case the parsing fails.
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
    function publish () {
      const selectContractNames = self._view.contractNames
      if (selectContractNames.children.length > 0 && selectContractNames.selectedIndex >= 0) {
        var contract = self.data.contractsDetails[selectContractNames.children[selectContractNames.selectedIndex].innerHTML]
        if (contract.metadata === undefined || contract.metadata.length === 0) {
          modalDialogCustom.alert('This contract may be abstract, may not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.')
        } else {
          publishOnSwarm(contract, self._deps.fileManager, function (err, uploaded) {
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
          }, function (item) { // triggered each time there's a new verified publish (means hash correspond)
            self._deps.swarmfileProvider.addReadOnly(item.hash, item.content)
          })
        }
      }
    }
    return self._view.el
  }

}

module.exports = CompileTab
