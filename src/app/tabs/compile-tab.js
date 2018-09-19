/* global Worker */
const yo = require('yo-yo')
const csjs = require('csjs-inject')
const copy = require('clipboard-copy')
var minixhr = require('minixhr')
var tooltip = require('../ui/tooltip')
var QueryParams = require('../../lib/query-params')
var globalRegistry = require('../../global/registry')
const TreeView = require('../ui/TreeView')
const modalDialog = require('../ui/modaldialog')
const copyToClipboard = require('../ui/copy-to-clipboard')
const modalDialogCustom = require('../ui/modal-dialog-custom')
const styleGuide = require('../ui/styles-guide/theme-chooser')
const parseContracts = require('../contract/contractParser')
const publishOnSwarm = require('../contract/publishOnSwarm')
const addTooltip = require('../ui/tooltip')
var helper = require('../../lib/helper')

const styles = styleGuide.chooser()

module.exports = class CompileTab {
  constructor (localRegistry) {
    const self = this
    self._view = {
      el: null,
      autoCompile: null,
      compileButton: null,
      warnCompilationSlow: null,
      compileIcon: null,
      compileContainer: null,
      errorContainer: null,
      errorContainerHead: null,
      contractNames: null,
      contractEl: null,
      config: {
        solidity: null
      },
      optimize: null
    }
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._components.queryParams = new QueryParams()
    // dependencies
    self._deps = {
      app: self._components.registry.get('app').api,
      editor: self._components.registry.get('editor').api,
      config: self._components.registry.get('config').api,
      compiler: self._components.registry.get('compiler').api,
      renderer: self._components.registry.get('renderer').api,
      swarmfileProvider: self._components.registry.get('fileproviders/swarm').api,
      fileManager: self._components.registry.get('filemanager').api
    }
    self.data = {
      hideWarnings: self._deps.config.get('hideWarnings') || false,
      autoCompile: self._deps.config.get('autoCompile'),
      compileTimeout: null,
      contractsDetails: {},
      maxTime: 1000,
      timeout: 300,
      allversions: null,
      selectedVersion: null,
      baseurl: 'https://solc-bin.ethereum.org/bin'
    }
    self.data.optimize = !!self._components.queryParams.get().optimize
    self._components.queryParams.update({ optimize: self.data.optimize })
    self._deps.compiler.setOptimize(self.data.optimize)

    self._deps.editor.event.register('contentChanged', scheduleCompilation)
    self._deps.editor.event.register('sessionSwitched', scheduleCompilation)
    function scheduleCompilation () {
      if (!self._deps.config.get('autoCompile')) return
      if (self.data.compileTimeout) window.clearTimeout(self.data.compileTimeout)
      self.data.compileTimeout = window.setTimeout(() => self._deps.app.runCompiler(), self.data.timeout)
    }
    self._deps.compiler.event.register('compilationDuration', function tabHighlighting (speed) {
      if (!self._view.warnCompilationSlow) return
      if (speed > self.data.maxTime) {
        const msg = `Last compilation took ${speed}ms. We suggest to turn off autocompilation.`
        self._view.warnCompilationSlow.setAttribute('title', msg)
        self._view.warnCompilationSlow.style.visibility = 'visible'
      } else {
        self._view.warnCompilationSlow.style.visibility = 'hidden'
      }
    })
    self._deps.editor.event.register('contentChanged', function changedFile () {
      if (!self._view.compileIcon) return
      const compileTab = document.querySelector('.compileView') // @TODO: compileView tab
      compileTab.style.color = styles.colors.red // @TODO: compileView tab
      self._view.compileIcon.classList.add(`${css.bouncingIcon}`) // @TODO: compileView tab
    })
    self._deps.compiler.event.register('loadingCompiler', function start () {
      if (!self._view.compileIcon) return
      self._view.compileIcon.classList.add(`${css.spinningIcon}`)
      self._view.warnCompilationSlow.style.visibility = 'hidden'
      self._view.compileIcon.setAttribute('title', 'compiler is loading, please wait a few moments.')
    })
    self._deps.compiler.event.register('compilationStarted', function start () {
      if (!self._view.compileIcon) return
      self._view.errorContainer.innerHTML = ''
      self._view.errorContainerHead.innerHTML = ''
      self._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
      self._view.compileIcon.classList.add(`${css.spinningIcon}`)
      self._view.compileIcon.setAttribute('title', 'compiling...')
    })
    self._deps.compiler.event.register('compilerLoaded', function loaded () {
      if (!self._view.compileIcon) return
      self._view.compileIcon.classList.remove(`${css.spinningIcon}`)
      self._view.compileIcon.setAttribute('title', '')
    })
    self._deps.compiler.event.register('compilationFinished', function finish (success, data, source) {
      if (self._view.compileIcon) {
        const compileTab = document.querySelector('.compileView')
        compileTab.style.color = styles.colors.black
        self._view.compileIcon.style.color = styles.colors.black
        self._view.compileIcon.classList.remove(`${css.spinningIcon}`)
        self._view.compileIcon.classList.remove(`${css.bouncingIcon}`)
        self._view.compileIcon.setAttribute('title', 'idle')
      }
      // reset the contractMetadata list (used by the publish action)
      self.data.contractsDetails = {}
      // refill the dropdown list
      self._view.contractNames.innerHTML = ''
      if (success) {
        self._view.contractNames.removeAttribute('disabled')
        self._deps.compiler.visitContracts(contract => {
          self.data.contractsDetails[contract.name] = parseContracts(contract.name, contract.object, self._deps.compiler.getSource(contract.file))
          var contractName = yo`<option>${contract.name}</option>`
          self._view.contractNames.appendChild(contractName)
        })
      } else {
        self._view.contractNames.setAttribute('disabled', true)
      }
      // hightlight the tab if error
      if (success) document.querySelector('.compileView').style.color = '' // @TODO: compileView tab
      else document.querySelector('.compileView').style.color = styles.colors.red // @TODO: compileView tab
      // display warning error if any
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
        data.errors.forEach(function (err) {
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
        self._deps.compiler.visitContracts((contract) => {
          self._deps.renderer.error(contract.name, self._view.errorContainer, {type: 'success'})
        })
      }
    })
  }
  addWarning (msg, settings) {
    const self = this
    self._deps.renderer.error(msg, self._view.errorContainerHead, settings)
  }
  render () {
    const self = this
    if (self._view.el) return self._view.el

    function onchangeLoadVersion (event) {
      self.data.selectedVersion = self._view.versionSelector.value
      self._updateVersionSelector()
    }

    function onchangeOptimize (event) {
      self.data.optimize = !!self._view.optimize.checked
      self._components.queryParams.update({ optimize: self.data.optimize })
      self._deps.compiler.setOptimize(self.data.optimize)
      self._deps.app.runCompiler()
    }

    self._deps.compiler.event.register('compilerLoaded', (version) => self.setVersionText(version))
    self.fetchAllVersion((allversions, selectedVersion) => {
      self.data.allversions = allversions
      self.data.selectedVersion = selectedVersion
      if (self._view.versionSelector) self._updateVersionSelector()
    })

    self._view.optimize = yo`<input onchange=${onchangeOptimize} id="optimize" type="checkbox">`
    if (self.data.optimize) self._view.optimize.setAttribute('checked', '')

    self._view.versionSelector = yo`
      <select onchange=${onchangeLoadVersion} class="${css.select}" id="versionSelector" disabled>
        <option disabled selected>Select new compiler version</option>
      </select>`
    if (self.data.allversions && self.data.selectedVersion) self._updateVersionSelector()
    self._view.version = yo`<span id="version"></span>`

    self._view.warnCompilationSlow = yo`<i title="Compilation Slow" style="visibility:hidden" class="${css.warnCompilationSlow} fa fa-exclamation-triangle" aria-hidden="true"></i>`
    self._view.compileIcon = yo`<i class="fa fa-refresh ${css.icon}" aria-hidden="true"></i>`
    self._view.compileButton = yo`<div class="${css.compileButton}" onclick=${compile} id="compile" title="Compile source code">${self._view.compileIcon} Start to compile</div>`
    self._view.autoCompile = yo`<input class="${css.autocompile}" onchange=${updateAutoCompile} id="autoCompile" type="checkbox" title="Auto compile">`
    self._view.hideWarningsBox = yo`<input class="${css.autocompile}" onchange=${hideWarnings} id="hideWarningsBox" type="checkbox" title="Hide warnings">`
    if (self.data.autoCompile) self._view.autoCompile.setAttribute('checked', '')
    if (self.data.hideWarnings) self._view.hideWarningsBox.setAttribute('checked', '')
    self._view.compileContainer = yo`
      <div class="${css.compileContainer}">
        <div class="${css.info}">
          <span>Current version:</span> ${self._view.version}
          <div class="${css.crow}">
            ${self._view.versionSelector}
          </div>
          <div class="${css.compileButtons}">
            <div class=${css.checkboxes}>
              <div class="${css.autocompileContainer}">
                ${self._view.autoCompile}
                <span class="${css.autocompileText}">Auto compile</span>
              </div>
              <div class="${css.optimizeContainer}">
                <div>${self._view.optimize}</div>
                <span class="${css.checkboxText}">Enable Optimization</span>
              </div>
              <div class=${css.hideWarningsContainer}>
                ${self._view.hideWarningsBox}
                <span class="${css.autocompileText}">Hide warnings</span>
              </div>
            </div>
            ${self._view.compileButton}
          </div>
        </div>
      </div>`
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
        ${self._view.compileContainer}
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
    function updateAutoCompile (event) { self._deps.config.set('autoCompile', self._view.autoCompile.checked) }
    function compile (event) { self._deps.app.runCompiler() }
    function hideWarnings (event) {
      self._deps.config.set('hideWarnings', self._view.hideWarningsBox.checked)
      compile()
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
          modalDialogCustom.alert('This contract does not implement all functions and thus cannot be published.')
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
  setVersionText (text) {
    const self = this
    self.data.version = text
    if (self._view.version) self._view.version.innerText = text
  }
  _updateVersionSelector () {
    const self = this
    self._view.versionSelector.innerHTML = ''
    self._view.versionSelector.appendChild(yo`<option disabled selected>Select new compiler version</option>`)
    self.data.allversions.forEach(build => self._view.versionSelector.appendChild(yo`<option value=${build.path}>${build.longVersion}</option>`))
    self._view.versionSelector.removeAttribute('disabled')
    self._components.queryParams.update({ version: self.data.selectedVersion })
    var url
    if (self.data.selectedVersion === 'builtin') {
      var location = window.document.location
      location = location.protocol + '//' + location.host + '/' + location.pathname
      if (location.endsWith('index.html')) location = location.substring(0, location.length - 10)
      if (!location.endsWith('/')) location += '/'
      url = location + 'soljson.js'
    } else {
      if (self.data.selectedVersion.indexOf('soljson') !== 0 || helper.checkSpecialChars(self.data.selectedVersion)) {
        return console.log('loading ' + self.data.selectedVersion + ' not allowed')
      }
      url = `${self.data.baseurl}/${self.data.selectedVersion}`
    }
    var isFirefox = typeof InstallTrigger !== 'undefined'
    if (document.location.protocol !== 'file:' && Worker !== undefined && isFirefox) {
      // Workers cannot load js on "file:"-URLs and we get a
      // "Uncaught RangeError: Maximum call stack size exceeded" error on Chromium,
      // resort to non-worker version in that case.
      self._deps.compiler.loadVersion(true, url)
      self.setVersionText('(loading using worker)')
    } else {
      self._deps.compiler.loadVersion(false, url)
      self.setVersionText('(loading)')
    }
  }
  fetchAllVersion (callback) {
    var self = this
    minixhr(`${self.data.baseurl}/list.json`, function (json, event) {
      // @TODO: optimise and cache results to improve app loading times
      var allversions, selectedVersion
      if (event.type !== 'error') {
        try {
          const data = JSON.parse(json)
          allversions = data.builds.slice().reverse()
          selectedVersion = data.releases[data.latestRelease]
          if (self._components.queryParams.get().version) selectedVersion = self._components.queryParams.get().version
        } catch (e) {
          tooltip('Cannot load compiler version list. It might have been blocked by an advertisement blocker. Please try deactivating any of them from this page and reload.')
        }
      } else {
        allversions = [{ path: 'builtin', longVersion: 'latest local version' }]
        selectedVersion = 'builtin'
      }
      callback(allversions, selectedVersion)
    })
  }
}

const css = csjs`
  .panicError {
    color: red;
    font-size: 20px;
  }
  .crow {
    display: flex;
    overflow: auto;
    clear: both;
    padding: .2em;
  }
  .checkboxText {
    font-weight: normal;
  }
  .crow label {
    cursor:pointer;
  }
  .crowNoFlex {
    overflow: auto;
    clear: both;
  }
  .select {
    font-weight: bold;
    margin: 10px 0px;
    ${styles.rightPanel.settingsTab.dropdown_SelectCompiler};
  }
  .info {
    ${styles.rightPanel.settingsTab.box_SolidityVersionInfo}
    margin-bottom: 1em;
    word-break: break-word;
  }
  .compileTabView {
    padding: 2%;
  }
  .contract {
    display: block;
    margin: 3% 0;
  }
  .compileContainer  {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    margin-bottom: 2%;
  }
  .autocompileContainer {
    display: flex;
    align-items: center;
  }
  .hideWarningsContainer {
    display: flex;
    align-items: center;
  }
  .autocompile {}
  .autocompileTitle {
    font-weight: bold;
    margin: 1% 0;
  }
  .autocompileText {
    margin: 1% 0;
    font-size: 12px;
    overflow: hidden;
    word-break: normal;
    line-height: initial;
  }
  .warnCompilationSlow {
    color: ${styles.rightPanel.compileTab.icon_WarnCompilation_Color};
    margin-left: 1%;
  }
  .compileButtons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .name {
    display: flex;
  }
  .size {
    display: flex;
  }
  .checkboxes {
    display: flex;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .compileButton {
    ${styles.rightPanel.compileTab.button_Compile};
    width: 100%;
    margin: 15px 0 10px 0;
    font-size: 12px;
  }
  .container {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    margin: 0;
    margin-bottom: 2%;
  }
  .contractContainer {
    display: flex;
    align-items: center;
    margin-bottom: 2%;
  }
  .optimizeContainer {
    display: flex;
  }
  .contractNames {
    ${styles.rightPanel.compileTab.dropdown_CompileContract};
    width:78%;
  }
  .contractHelperButtons {
    display: flex;
    cursor: pointer;
    text-align: center;
    justify-content: flex-end;
    margin: 15px 15px 10px 0;
  }
  .copyButton {
    ${styles.rightPanel.compileTab.button_Details};
    padding: 0 7px;
    min-width: 50px;
    width: auto;
    margin-left: 5px;
    background-color: inherit;
    border: inherit;
  }
  .bytecodeButton {
    min-width: 80px;
  }
  .copyIcon {
    margin-right: 5px;
  }
  .details {
    ${styles.rightPanel.compileTab.button_Details};
    min-width: 70px;
    width: 80px;
  }
  .publish {
    display: flex;
    align-items: center;
    margin-left: 10px;
    cursor: pointer;
  }
  .log {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    display: flex;
    flex-direction: column;
    margin-bottom: 5%;
    overflow: visible;
  }
  .key {
    margin-right: 5px;
    color: ${styles.rightPanel.text_Primary};
    text-transform: uppercase;
    width: 100%;
  }
  .value {
    display: flex;
    width: 100%;
    margin-top: 1.5%;
  }
  .questionMark {
    margin-left: 2%;
    cursor: pointer;
    color: ${styles.rightPanel.icon_Color_TogglePanel};
  }
  .questionMark:hover {
    color: ${styles.rightPanel.icon_HoverColor_TogglePanel};
  }
  .detailsJSON {
    padding: 8px 0;
    background-color: ${styles.rightPanel.modalDialog_BackgroundColor_Primary};
    border: none;
    color: ${styles.rightPanel.modalDialog_text_Secondary};
  }
  .icon {
    margin-right: 0.3em;
  }
  .spinningIcon {
    margin-right: .3em;
    animation: spin 2s linear infinite;
  }
  .bouncingIcon {
    margin-right: .3em;
    animation: bounce 2s infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @-webkit-keyframes bounce {
    0% {
      margin-bottom: 0;
      color: ${styles.colors.transparent};
    }
    70% {
      margin-bottom: 0;
      color: ${styles.rightPanel.text_Secondary};
    }
    100% {
      margin-bottom: 0;
      color: ${styles.colors.transparent};
    }
  }
`
