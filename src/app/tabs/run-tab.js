'use strict'
var $ = require('jquery')
var yo = require('yo-yo')
var helper = require('../../lib/helper.js')
var txExecution = require('../execution/txExecution')
var txFormat = require('../execution/txFormat')
var txHelper = require('../execution/txHelper')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var executionContext = require('../../execution-context')
var copyToClipboard = require('../ui/copy-to-clipboard')
var Recorder = require('../../recorder')
var EventManager = require('remix-lib').EventManager
var addTooltip = require('../ui/tooltip')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('remix-lib').ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .runTabView {
    padding: 2%;
    display: flex;
    flex-direction: column;
  }
  .settings {
    ${styles.rightPanel.runTab.box_RunTab}
    margin-bottom: 2%;
    padding: 10px 15px 15px 15px;
  }
  .crow {
    margin-top: .5em;
    display: flex;
    align-items: center;
  }
  .col1 {
    width: 30%;
    float: left;
    align-self: center;
  }
  .col1_1 {
    font-size: 12px;
    width: 25%;
    min-width: 75px;
    float: left;
    align-self: center;
  }
  .environment {
    display: flex;
    align-items: center;
    position: relative;
  }
  .col2 {
    ${styles.rightPanel.runTab.input_RunTab}
  }
  .col2_1 {
    ${styles.rightPanel.runTab.input_RunTab}
    width: 165px;
    min-width: 165px;
  }
  .col2_2 {
    ${styles.rightPanel.runTab.dropdown_RunTab}
    width: 82px;
    min-width: 82px;
  }
  .select {
    ${styles.rightPanel.runTab.dropdown_RunTab}
    font-weight: normal;
    min-width: 150px;
  }
  .instanceContainer {
    display: flex;
    flex-direction: column;
    margin-top: 2%;
    border: none;
    text-align: center;
  }
  .pendingTxsContainer  {
    ${styles.rightPanel.runTab.box_Instance}
    display: flex;
    flex-direction: column;
    margin-top: 2%;
    border: none;
    text-align: center;
  }
  .container {
    ${styles.rightPanel.runTab.box_RunTab}
    margin-top: 2%;
  }
  .contractNames {
    ${styles.rightPanel.runTab.dropdown_RunTab}
    width: 100%;
    border: 1px solid
  }
  .contractNamesError {
    border: 1px solid ${styles.appProperties.errorText_Color}
  }
  .subcontainer {
    display: flex;
    flex-direction: row;
    align-items: baseline;
  }
  .button {
    display: flex;
    align-items: center;
    margin-top: 2%;
  }
  .transaction {
    ${styles.rightPanel.runTab.button_transaction}
  }
  .atAddress {
    ${styles.rightPanel.runTab.button_atAddress}
  }
  .create {
    ${styles.rightPanel.runTab.button_Create}
  }
  .input {
    ${styles.rightPanel.runTab.input_RunTab}
  }
  .noInstancesText {
    ${styles.rightPanel.runTab.box_Instance}
    font-style: italic;
  }
  .pendingTxsText {
    ${styles.rightPanel.runTab.borderBox_Instance}
    font-style: italic;
  }
  .item {
    margin-right: 1em;
    display: flex;
    align-items: center;
  }
  .transact {
    color: ${styles.colors.lightRed};
    margin-right: .3em;
  }
  .payable {
    color: ${styles.colors.red};
    margin-right: .3em;
  }
  .call {
    color: ${styles.colors.lightBlue};
    margin-right: .3em;
  }
  .pendingContainer {
    display: flex;
    align-items: baseline;
  }
  .pending {
    height: 25px;
    text-align: center;
    padding-left: 10px;
    border-radius: 3px;
    margin-left: 5px;
  }
  .icon {
    font-size: 12px;
    color: ${styles.rightPanel.runTab.icon_Color};
    margin-left: 5px;
  }
  .icon:hover {
    font-size: 12px;
    color: ${styles.rightPanel.runTab.icon_HoverColor};
  }
  .errorIcon {
    color: ${styles.appProperties.errorText_Color};
    margin-left: 15px;
  }
  .failDesc {
    color: ${styles.appProperties.errorText_Color};
    padding-left: 10px;
    display: inline;
  }
  .network {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: absolute;
    color: grey;
    width: 100%;
    height: 100%;
    padding-right: 28px;
    pointer-events: none;
  }
  .networkItem {
    margin-right: 5px;
  }
  .clearinstance {
    font-size: 20px;
    cursor: pointer;
    margin-right: 10px;
  }
  .transactionActions {
    float: right;
  }
  .createAccount {
    margin-left: 5px;
    cursor: pointer;
  }
  .createAccount:hover   {
    color: ${styles.colors.orange};
  }
`

module.exports = runTab

var instanceContainer = yo`<div class="${css.instanceContainer}"></div>`
var noInstancesText = yo`<div class="${css.noInstancesText}">0 contract Instances</div>`

var pendingTxsText = yo`<span></span>`

function runTab (container, appAPI, appEvents, opts) {
  var events = new EventManager()

  var clearInstanceElement = yo`<i class="${css.clearinstance} fa fa-minus-square-o" title="Clear Instances List" aria-hidden="true"></i>`
  clearInstanceElement.addEventListener('click', () => {
    events.trigger('clearInstance', [])
  })
  var recorderInterface = makeRecorder(events, appAPI, appEvents)
  var pendingTxsContainer = yo`
  <div class="${css.pendingTxsContainer}">
    <div class="${css.pendingTxsText}">
      ${pendingTxsText}
      <span class="${css.transactionActions}">
        ${clearInstanceElement}
        ${recorderInterface.recordButton}
        ${recorderInterface.runButton}
      </span>
    </div>
  </div>`

  var el = yo`
  <div class="${css.runTabView}" id="runTabView">
    ${settings(container, appAPI, appEvents)}
    ${contractDropdown(events, appAPI, appEvents, instanceContainer)}
    ${pendingTxsContainer}
    ${instanceContainer}
  </div>
  `
  container.appendChild(el)

  // PENDING transactions
  function updatePendingTxs (container, appAPI) {
    var pendingCount = Object.keys(appAPI.udapp().pendingTransactions()).length
    pendingTxsText.innerText = pendingCount + ' pending transactions'
  }

  // DROPDOWN
  var selectExEnv = el.querySelector('#selectExEnvOptions')

  function setFinalContext () {
    // set the final context. Cause it is possible that this is not the one we've originaly selected
    selectExEnv.value = executionContext.getProvider()
    fillAccountsList(appAPI, el)
    events.trigger('clearInstance', [])
  }

  selectExEnv.addEventListener('change', function (event) {
    let context = selectExEnv.options[selectExEnv.selectedIndex].value
    executionContext.executionContextChange(context, null, () => {
      modalDialogCustom.confirm(null, 'Are you sure you want to connect to an ethereum node?', () => {
        modalDialogCustom.prompt(null, 'Web3 Provider Endpoint', 'http://localhost:8545', (target) => {
          executionContext.setProviderFromEndpoint(target, context, (alertMsg) => {
            if (alertMsg) {
              modalDialogCustom.alert(alertMsg)
            }
            setFinalContext()
          })
        }, setFinalContext)
      }, setFinalContext)
    }, (alertMsg) => {
      modalDialogCustom.alert(alertMsg)
    }, setFinalContext)
  })
  selectExEnv.value = executionContext.getProvider()
  fillAccountsList(appAPI, el)
  setInterval(() => {
    updateAccountBalances(container, appAPI)
    updatePendingTxs(container, appAPI)
  }, 10000)

  events.register('clearInstance', () => {
    instanceContainer.innerHTML = '' // clear the instances list
    noInstancesText.style.display = 'block'
    instanceContainer.appendChild(noInstancesText)
  })
  return el
}

function fillAccountsList (appAPI, container) {
  var $txOrigin = $(container.querySelector('#txorigin'))
  $txOrigin.empty()
  appAPI.udapp().getAccounts((err, accounts) => {
    if (err) { addTooltip(`Cannot get account list: ${err}`) }
    if (accounts && accounts[0]) {
      for (var a in accounts) { $txOrigin.append($('<option />').val(accounts[a]).text(accounts[a])) }
      $txOrigin.val(accounts[0])
    } else {
      $txOrigin.val('unknown')
    }
  })
}

function updateAccountBalances (container, appAPI) {
  var accounts = $(container.querySelector('#txorigin')).children('option')
  accounts.each(function (index, value) {
    (function (acc) {
      appAPI.getBalance(accounts[acc].value, function (err, res) {
        if (!err) {
          accounts[acc].innerText = helper.shortenAddress(accounts[acc].value, res)
        }
      })
    })(index)
  })
}

/* ------------------------------------------------
    RECORDER
------------------------------------------------ */
function makeRecorder (events, appAPI, appEvents) {
  var recorder = new Recorder({
    events: {
      udapp: appEvents.udapp,
      executioncontext: executionContext.event,
      runtab: events
    },
    api: appAPI
  })
  var css2 = csjs`
    .container {
    }
    .recorder {
      font-size: 20px;
      cursor: pointer;
    }
    .runTxs {
      margin-left: 10px;
      font-size: 20px;
      cursor: pointer;
    }
  `

  var recordButton = yo`<i class="fa fa-floppy-o savetransaction ${css2.recorder}" title="Save Transactions" aria-hidden="true"></i>`
  var runButton = yo`<i class="fa fa-play runtransaction ${css2.runTxs}"  title="Run Transactions" aria-hidden="true"></i>`

  recordButton.onclick = () => {
    var txJSON = JSON.stringify(recorder.getAll(), null, 2)
    var path = appAPI.currentPath()
    modalDialogCustom.prompt(null, 'save ran transactions to file (e.g. `scenario.json`). The file is going to be saved under ' + path, 'scenario.json', input => {
      var fileProvider = appAPI.fileProviderOf(path)
      if (fileProvider) {
        var newFile = path + input
        newFile = helper.createNonClashingName(newFile, fileProvider, '.json')
        if (!fileProvider.set(newFile, txJSON)) {
          modalDialogCustom.alert('Failed to create file ' + newFile)
        } else {
          appAPI.switchFile(newFile)
        }
      }
    })
  }
  runButton.onclick = () => {
    var currentFile = appAPI.config.get('currentFile')
    appAPI.fileProviderOf(currentFile).get(currentFile, (error, json) => {
      if (error) {
        modalDialogCustom.alert('Invalid Scenario File ' + error)
      } else {
        if (currentFile.match('.json$')) {
          try {
            var obj = JSON.parse(json)
            var txArray = obj.transactions || []
            var accounts = obj.accounts || []
            var options = obj.options
            var abis = obj.abis
            var linkReferences = obj.linkReferences || {}
          } catch (e) {
            return modalDialogCustom.alert('Invalid Scenario File, please try again')
          }
          if (txArray.length) {
            noInstancesText.style.display = 'none'
            recorder.run(txArray, accounts, options, abis, linkReferences, (abi, address, contractName) => {
              instanceContainer.appendChild(appAPI.udappUI().renderInstanceFromABI(abi, address, contractName))
            })
          }
        } else {
          modalDialogCustom.alert('A Scenario File is required. The file must be of type JSON. Use the "Save Transactions" Button to generate a  new Scenario File.')
        }
      }
    })
  }
  return { recordButton, runButton }
}
/* ------------------------------------------------
    section CONTRACT DROPDOWN and BUTTONS
------------------------------------------------ */

function contractDropdown (events, appAPI, appEvents, instanceContainer) {
  instanceContainer.appendChild(noInstancesText)
  var compFails = yo`<i title="Contract compilation failed. Please check the compile tab for more information." class="fa fa-times-circle ${css.errorIcon}" ></i>`
  appEvents.compiler.register('compilationFinished', function (success, data, source) {
    getContractNames(success, data)
    if (success) {
      compFails.style.display = 'none'
      document.querySelector(`.${css.contractNames}`).classList.remove(css.contractNamesError)
    } else {
      compFails.style.display = 'block'
      document.querySelector(`.${css.contractNames}`).classList.add(css.contractNamesError)
    }
  })

  var atAddressButtonInput = yo`<input class="${css.input} ataddressinput" placeholder="Load contract from Address" title="atAddress" />`
  var createButtonInput = yo`<input class="${css.input} create" placeholder="" title="Create" />`
  var selectContractNames = yo`<select class="${css.contractNames}" disabled></select>`

  function getSelectedContract () {
    var contractName = selectContractNames.children[selectContractNames.selectedIndex].innerHTML
    if (contractName) {
      return {
        name: contractName,
        contract: appAPI.getContract(contractName)
      }
    }
    return null
  }
  appAPI.getSelectedContract = getSelectedContract

  var el = yo`
    <div class="${css.container}">
      <div class="${css.subcontainer}">
        ${selectContractNames} ${compFails}
      </div>
      <div class="${css.buttons}">
        <div class="${css.button}">
          ${createButtonInput}
          <div class="${css.create}" onclick=${function () { createInstance() }} >Create</div>
        </div>
        <div class="${css.button}">
          ${atAddressButtonInput}
          <div class="${css.atAddress}" onclick=${function () { loadFromAddress(appAPI) }}>At Address</div>
        </div>
      </div>
    </div>
  `

  function setInputParamsPlaceHolder () {
    createButtonInput.value = ''
    if (appAPI.getContract && selectContractNames.selectedIndex >= 0 && selectContractNames.children.length > 0) {
      var ctrabi = txHelper.getConstructorInterface(getSelectedContract().contract.object.abi)
      if (ctrabi.inputs.length) {
        createButtonInput.setAttribute('placeholder', txHelper.inputParametersDeclarationToString(ctrabi.inputs))
        createButtonInput.removeAttribute('disabled')
        return
      }
    }
    createButtonInput.setAttribute('placeholder', '')
    createButtonInput.setAttribute('disabled', true)
  }

  selectContractNames.addEventListener('change', setInputParamsPlaceHolder)

  // ADD BUTTONS AT ADDRESS AND CREATE
  function createInstance () {
    var selectedContract = getSelectedContract()

    if (selectedContract.contract.object.evm.bytecode.object.length === 0) {
      modalDialogCustom.alert('This contract does not implement all functions and thus cannot be created.')
      return
    }

    var constructor = txHelper.getConstructorInterface(selectedContract.contract.object.abi)
    var args = createButtonInput.value
    txFormat.buildData(selectedContract.name, selectedContract.contract.object, appAPI.getContracts(), true, constructor, args, appAPI.udapp(), (error, data) => {
      if (!error) {
        appAPI.logMessage(`creation of ${selectedContract.name} pending...`)
        txExecution.createContract(data, appAPI.udapp(), (error, txResult) => {
          if (!error) {
            var isVM = executionContext.isVM()
            if (isVM) {
              var vmError = txExecution.checkVMError(txResult)
              if (vmError.error) {
                appAPI.logMessage(vmError.message)
                return
              }
            }
            noInstancesText.style.display = 'none'
            var address = isVM ? txResult.result.createdAddress : txResult.result.contractAddress
            instanceContainer.appendChild(appAPI.udappUI().renderInstance(selectedContract.contract.object, address, selectContractNames.value))
          } else {
            appAPI.logMessage(`creation of ${selectedContract.name} errored: ` + error)
          }
        })
      } else {
        appAPI.logMessage(`creation of ${selectedContract.name} errored: ` + error)
      }
    }, (msg) => {
      appAPI.logMessage(msg)
    })
  }

  function loadFromAddress (appAPI) {
    noInstancesText.style.display = 'none'
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    var address = atAddressButtonInput.value
    if (/.(.abi)$/.exec(appAPI.currentFile())) {
      modalDialogCustom.confirm(null, 'Do you really want to interact with ' + address + ' using the current ABI definition ?', () => {
        var abi
        try {
          abi = JSON.parse(appAPI.editorContent())
        } catch (e) {
          return modalDialogCustom.alert('Failed to parse the current file as JSON ABI.')
        }
        instanceContainer.appendChild(appAPI.udappUI().renderInstanceFromABI(abi, address, address))
      })
    } else {
      var contract = appAPI.getContract(contractNames.children[contractNames.selectedIndex].innerHTML)
      instanceContainer.appendChild(appAPI.udappUI().renderInstance(contract.object, address, selectContractNames.value))
    }
  }

  // GET NAMES OF ALL THE CONTRACTS
  function getContractNames (success, data) {
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    contractNames.innerHTML = ''
    if (success) {
      selectContractNames.removeAttribute('disabled')
      appAPI.visitContracts((contract) => {
        contractNames.appendChild(yo`<option>${contract.name}</option>`)
      })
    } else {
      selectContractNames.setAttribute('disabled', true)
    }
    setInputParamsPlaceHolder()
  }

  return el
}

/* ------------------------------------------------
    section SETTINGS: Environment, Account, Gas, Value
------------------------------------------------ */
function settings (container, appAPI, appEvents) {
  // SETTINGS HTML
  var net = yo`<span class=${css.network}></span>`
  const updateNetwork = () => {
    executionContext.detectNetwork((err, { id, name } = {}) => {
      if (err) {
        console.error(err)
        net.innerHTML = 'can\'t detect network '
      } else {
        net.innerHTML = `<i class="${css.networkItem} fa fa-plug" aria-hidden="true"></i> ${name} (${id || '-'})`
      }
    })
  }
  setInterval(updateNetwork, 5000)
  function newAccount () {
    appAPI.newAccount('', (error, address) => {
      if (!error) {
        container.querySelector('#txorigin').appendChild(yo`<option value=${address}>${address}</option>`)
        addTooltip(`account ${address} created`)
      } else {
        addTooltip('Cannot create an account: ' + error)
      }
    })
  }
  var el = yo`
    <div class="${css.settings}">
      <div class="${css.crow}">
        <div id="selectExEnv" class="${css.col1_1}">
          Environment
        </div>
        <div class=${css.environment}>
          ${net}
          <select id="selectExEnvOptions" onchange=${updateNetwork} class="${css.select}">
            <option id="vm-mode"
              title="Execution environment does not connect to any node, everything is local and in memory only."
              value="vm"
              checked name="executionContext">
              JavaScript VM
            </option>
            <option id="injected-mode"
              title="Execution environment has been provided by Mist or similar provider."
              value="injected"
              checked name="executionContext">
              Injected Web3
            </option>
            <option id="web3-mode"
              title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
              If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
              value="web3"
              name="executionContext">
              Web3 Provider
            </option>
          </select>
          <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md" target="_blank"><i class="${css.icon} fa fa-info"></i></a>
        </div>
      </div>
      <div class="${css.crow}">
        <div class="${css.col1_1}">Account</div>
        <select name="txorigin" class="${css.select}" id="txorigin"></select>
          ${copyToClipboard(() => document.querySelector('#runTabView #txorigin').value)}
          <i class="fa fa-plus-square-o ${css.createAccount}" aria-hidden="true" onclick=${newAccount} title="Create a new account"></i>
      </div>
      <div class="${css.crow}">
        <div class="${css.col1_1}">Gas limit</div>
        <input type="number" class="${css.col2}" id="gasLimit" value="3000000">
      </div>
      <div class="${css.crow}" style="display: none">
      <div class="${css.col1_1}">Gas Price</div>
        <input type="number" class="${css.col2}" id="gasPrice" value="0">
      </div>
      <div class="${css.crow}">
      <div class="${css.col1_1}">Value</div>
        <input type="text" class="${css.col2_1}" id="value" value="0" title="Enter the value and choose the unit">
        <select name="unit" class="${css.col2_2}" id="unit">
          <option data-unit="wei">wei</option>
          <option data-unit="gwei">gwei</option>
          <option data-unit="finney">finney</option>
          <option data-unit="ether">ether</option>
        </select>
      </div>
    </div>
  `

  // EVENTS
  appEvents.udapp.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
    if (error) return
    if (!lookupOnly) el.querySelector('#value').value = '0'
    updateAccountBalances(container, appAPI)
  })

  return el
}
