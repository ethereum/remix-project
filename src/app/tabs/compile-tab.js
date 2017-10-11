/* global */
var $ = require('jquery')

var yo = require('yo-yo')
const copy = require('clipboard-copy')

var parseContracts = require('../contract/contractParser')
var publishOnSwarm = require('../contract/publishOnSwarm')
var modalDialog = require('../ui/modaldialog')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var TreeView = require('ethereum-remix').ui.TreeView

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

var css = csjs`
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
    width: 90px;
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
  }
  .name {
    display: flex;
  }
  .size {
    display: flex;
  }
  .compileButton {
    ${styles.rightPanel.compileTab.button_Compile};
    width: 120px;
    min-width: 110px;
    margin-right: 1%;
    font-size: 12px;
  }
  .container {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    margin: 0;
    display: flex;
    align-items: center;
  }
  .contractNames {
    ${styles.rightPanel.compileTab.dropdown_CompileContract};
    margin-right: 5%;
  }
  .contractButtons {
    display: flex;
    cursor: pointer;
    justify-content: center;
    text-align: center;
  }
  .details {
    ${styles.rightPanel.compileTab.button_Details};
  }
  .publish {
    ${styles.rightPanel.compileTab.button_Publish};
    margin-left: 2%;
    width: 120px;
  }
  .log {
    ${styles.rightPanel.compileTab.box_CompileContainer};
    display: flex;
    flex-direction: column;
    margin-bottom: 5%;
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
  .copyDetails,
  .questionMark {
    margin-left: 2%;
    cursor: pointer;
    color: ${styles.rightPanel.icon_Color_TogglePanel};
  }
  .copyDetails:hover,
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
    margin-right: 3%;
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

module.exports = compileTab

function compileTab (container, appAPI, appEvents, opts) {
  if (typeof container === 'string') container = document.querySelector(container)
  if (!container) throw new Error('no container given')

  // Containers
  var warnCompilationSlow = yo`<i title="Copy Address" style="display:none" class="${css.warnCompilationSlow} fa fa-exclamation-triangle" aria-hidden="true"></i>`
  var compileIcon = yo`<i class="fa fa-refresh ${css.icon}" aria-hidden="true"></i>`
  var compileContainer = yo`
      <div class="${css.compileContainer}">
        <div class="${css.compileButtons}">
          <div class="${css.compileButton} "id="compile" title="Compile source code">${compileIcon} Start to compile</div>
          <div class="${css.autocompileContainer}">
            <input class="${css.autocompile}" id="autoCompile" type="checkbox" title="Auto compile">
            <span class="${css.autocompileText}">Auto compile</span>
          </div>
          ${warnCompilationSlow}
        </div>
      </div>
  `

  compileContainer.querySelector('#compile').addEventListener('click', () => {
    appAPI.runCompiler()
  })

  var compileTimeout = null
  function scheduleCompilation () {
    if (!appAPI.config.get('autoCompile')) {
      return
    }

    if (compileTimeout) {
      window.clearTimeout(compileTimeout)
    }
    compileTimeout = window.setTimeout(() => {
      appAPI.runCompiler()
    }, 300)
  }

  appEvents.editor.register('contentChanged', () => {
    scheduleCompilation()
  })

  appEvents.editor.register('sessionSwitched', () => {
    scheduleCompilation()
  })

  // ----------------- autoCompile -----------------
  var autoCompileInput = compileContainer.querySelector('#autoCompile')
  var autoCompile = true
  if (appAPI.config.exists('autoCompile')) {
    autoCompile = appAPI.config.get('autoCompile')
  }
  appAPI.config.set('autoCompile', autoCompile)
  if (autoCompile) {
    autoCompileInput.setAttribute('checked', autoCompile)
  }

  autoCompileInput.addEventListener('change', function () {
    appAPI.config.set('autoCompile', autoCompileInput.checked)
  })

  // REGISTER EVENTS

  // compilationDuration
  appEvents.compiler.register('compilationDuration', function tabHighlighting (speed) {
    if (speed > 1000) {
      warnCompilationSlow.setAttribute('title', `Last compilation took ${speed}ms. We suggest to turn off autocompilation.`)
      warnCompilationSlow.style.display = 'inline-block'
    } else {
      warnCompilationSlow.style.display = 'none'
    }
  })
  // loadingCompiler
  appEvents.editor.register('contentChanged', function changedFile () {
    var compileTab = document.querySelector('.compileView')
    compileTab.style.color = styles.colors.red
    compileIcon.classList.add(`${css.bouncingIcon}`)
  })
  appEvents.compiler.register('loadingCompiler', function start () {
    compileIcon.classList.add(`${css.spinningIcon}`)
    warnCompilationSlow.style.display = 'none'
    compileIcon.setAttribute('title', 'compiler is loading, please wait a few moments.')
  })
  appEvents.compiler.register('compilationFinished', function finish () {
    var compileTab = document.querySelector('.compileView')
    compileTab.style.color = styles.colors.black
    compileIcon.style.color = styles.colors.black
    compileIcon.classList.remove(`${css.spinningIcon}`)
    compileIcon.classList.remove(`${css.bouncingIcon}`)
    compileIcon.setAttribute('title', 'idle')
  })
  appEvents.compiler.register('compilationStarted', function start () {
    compileIcon.classList.remove(`${css.bouncingIcon}`)
    compileIcon.classList.add(`${css.spinningIcon}`)
    compileIcon.setAttribute('title', 'compiling...')
  })
  appEvents.compiler.register('compilerLoaded', function loaded () {
    compileIcon.classList.remove(`${css.spinningIcon}`)
    compileIcon.setAttribute('title', '')
  })

  var el = yo`
    <div class="${css.compileTabView}" id="compileTabView">
      ${compileContainer}
      ${contractNames(container, appAPI, appEvents, opts)}
      <div class='error'></div>
    </div>
  `
  container.appendChild(el)

  /* ------------------------------------------------
    section CONTRACT DROPDOWN, DETAILS AND PUBLISH
  ------------------------------------------------ */

  function contractNames (container, appAPI, appEvents, opts) {
    var contractsDetails = {}

    appEvents.compiler.register('compilationStarted', () => {
      var errorContainer = container.querySelector('.error')
      errorContainer.innerHTML = ''
    })

    appEvents.compiler.register('compilationFinished', function (success, data, source) {
      // reset the contractMetadata list (used by the publish action)
      contractsDetails = {}
      // refill the dropdown list
      getContractNames(success, data)
      // hightlight the tab if error
      if (success) {
        document.querySelector('.compileView').style.color = ''
      } else {
        document.querySelector('.compileView').style.color = styles.colors.red
      }
      // display warning error if any
      var errorContainer = container.querySelector('.error')
      var error = false
      if (data['error']) {
        error = true
        appAPI.compilationMessage(data['error'], $(errorContainer))
      }
      if (data['errors']) {
        if (data['errors'].length) error = true
        data['errors'].forEach(function (err) {
          appAPI.compilationMessage(err, $(errorContainer))
        })
      }
      if (!error) {
        if (data.contracts) {
          for (var contract in data.contracts) {
            appAPI.compilationMessage(contract, $(errorContainer), {type: 'success'})
          }
        }
      }
    })

    appEvents.staticAnalysis.register('staticAnaysisWarning', (count) => {
      if (count) {
        var errorContainer = container.querySelector('.error')
        appAPI.compilationMessage(`Static Analysis raised ${count} warning(s) that requires your attention.`, $(errorContainer), {
          type: 'warning',
          click: () => appAPI.switchTab('staticanalysisView')
        })
      }
    })

    var el = yo`
      <div class="${css.container}">
        <select class="${css.contractNames}" disabled></select>
        <div class="${css.contractButtons}">
          <div title="Display Contract Details" class="${css.details}" onclick=${() => { details() }}>Details</div>
          <div title="Publish on Swarm" class="${css.publish}" onclick=${() => { publish(appAPI) }}>Publish on Swarm</div>
        </div>
      </div>
    `

    // HELPERS

    // GET NAMES OF ALL THE CONTRACTS
    function getContractNames (success, data) {
      var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
      contractNames.innerHTML = ''
      if (success) {
        contractNames.removeAttribute('disabled')
        for (var name in data.contracts) {
          contractsDetails[name] = parseContracts(name, data.contracts[name], appAPI.currentCompiledSourceCode())
          var contractName = yo`
            <option>
              ${name}
            </option>`
          contractNames.appendChild(contractName)
        }
        appAPI.resetDapp(contractsDetails)
      } else {
        contractNames.setAttribute('disabled', true)
        appAPI.resetDapp({})
      }
    }

    function details () {
      var select = el.querySelector('select')
      if (select.children.length > 0 && select.selectedIndex >= 0) {
        var contractName = select.children[select.selectedIndex].innerHTML
        var contractProperties = contractsDetails[contractName]
        var log = yo`<div class="${css.detailsJSON}"></div>`
        Object.keys(contractProperties).map(propertyName => {
          var copyDetails = yo`<span class="${css.copyDetails}"><i title="Copy value to clipboard" class="fa fa-clipboard" onclick=${() => { copy(contractProperties[propertyName]) }} aria-hidden="true"></i></span>`
          var questionMark = yo`<span class="${css.questionMark}"><i title="${detailsHelpSection()[propertyName]}" class="fa fa-question-circle" aria-hidden="true"></i></span>`
          var keyDisplayName
          (propertyName === 'interface') ? keyDisplayName = 'interface - abi' : keyDisplayName = propertyName
          log.appendChild(yo`
            <div class=${css.log}>
              <div class="${css.key}">${keyDisplayName} ${copyDetails} ${questionMark}</div>
              ${insertValue(contractProperties, propertyName)}
            </div>
            `)
        })
        modalDialog(contractName, log, {label: ''}, {label: 'Close'})
      }
    }

    function insertValue (details, propertyName) {
      var value = yo`<pre class="${css.value}"></pre>`
      var node
      if (propertyName === 'bytecode' || propertyName === 'metadataHash' || propertyName === 'swarmLocation' || propertyName === 'Runtime Bytecode' || propertyName === 'Opcodes') {
        node = yo`<div>${details[propertyName].slice(0, 60) + '...'}</div>`
      } else if (propertyName === 'web3Deploy' || propertyName === 'name') {
        node = yo`<pre>${details[propertyName]}</pre>`
      } else if (propertyName === 'interface' || propertyName === 'metadata') {
        var treeView = new TreeView({
          extractData: function (item, parent, key) {
            var ret = {}
            if (item instanceof Array) {
              ret.children = item.map((item, index) => {
                return {key: index, value: item}
              })
              ret.self = ''
            } else if (item instanceof Object) {
              ret.children = Object.keys(item).map((key) => {
                return {key: key, value: item[key]}
              })
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
            node = yo`<div>${treeView.render(JSON.parse(details[propertyName]))}</div>` // catch in case the parsing fails.
          } catch (e) {
            node = yo`<div>Unable to display "${propertyName}": ${e.message}</div>`
          }
        } else {
          node = yo`<div> - </div>`
        }
      } else {
        node = yo`<div>${JSON.stringify(details[propertyName], null, 4)}</div>`
      }
      if (node) value.appendChild(node)
      return value
    }

    function publish (appAPI) {
      var selectContractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
      if (selectContractNames.children.length > 0 && selectContractNames.selectedIndex >= 0) {
        var contract = contractsDetails[selectContractNames.children[selectContractNames.selectedIndex].innerHTML]
        if (contract.metadata === undefined || contract.metadata.length === 0) {
          modalDialogCustom.alert('This contract does not implement all functions and thus cannot be published.')
        } else {
          publishOnSwarm(contract, appAPI, function (err) {
            if (err) {
              try {
                err = JSON.stringify(err)
              } catch (e) {}
              modalDialogCustom.alert(yo`<span>Failed to publish metadata file to swarm, please check the Swarm gateways is available ( swarm-gateways.net ).<br />
              ${err}</span>`)
            } else {
              modalDialogCustom.alert(yo`<span>Metadata published successfully.<br />The Swarm address of the metadata file is available in the contract details.</span>`)
            }
          })
        }
      }
    }
    return el
  }
}

function detailsHelpSection () {
  return {
    'Assembly': 'Assembly opcodes describing the contract including corresponding solidity source code',
    'Opcodes': 'Assembly opcodes describing the contract',
    'Runtime Bytecode': 'Bytecode storing the state and being executed during normal contract call',
    'bytecode': 'Bytecode being executed during contract creation',
    'functionHashes': 'List of declared function and their corresponding hash',
    'gasEstimates': 'Gas estimation for each function call',
    'metadata': 'Contains all informations related to the compilation',
    'metadataHash': 'Hash representing all metadata information',
    'interface': 'ABI: describing all the functions (input/output params, scope, ...)',
    'name': 'Name of the compiled contract',
    'swarmLocation': 'Swarm url where all metadata information can be found (contract needs to be published first)',
    'web3Deploy': 'Copy/paste this code to any JavaScript/Web3 console to deploy this contract'
  }
}
