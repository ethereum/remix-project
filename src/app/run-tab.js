/* global alert */
var $ = require('jquery')

var yo = require('yo-yo')
var helper = require('../lib/helper.js')
var txExecution = require('./execution/txExecution')
var txFormat = require('./execution/txFormat')
var txHelper = require('./execution/txHelper')
const copy = require('clipboard-copy')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = require('./style-guide')
var styles = styleGuide()

var css = csjs`
  .runTabView {
    padding: 2%;
    display: flex;
    flex-direction: column;
  }
  .settings extends ${styles.displayBox} {
    margin-bottom: 2%;
    padding: 10px 15px 15px 15px;
  }
  .crow {
    margin-top: .5em;
    display: flex;
  }
  .col1 extends ${styles.titleL} {
    width: 30%;
    float: left;
    align-self: center;
  }
  .col1_1 extends ${styles.titleM} {
    font-size: 12px;
    width: 25%;
    min-width: 50px;
    float: left;
    align-self: center;
  }
  .col2 extends ${styles.inputField}{
    width: 75%;
    float: left;
  }
  .select extends ${styles.dropdown} {
    width: 75%;
    float: left;
    text-align: center;
  }
  .copyaddress {
    color: #C6CFF7;
    margin-left: 0.5em;
    margin-top: 0.7em;
    cursor: pointer;
    opacity: .7;
  }
  .copyaddress:hover {
    opacity: 1;
  }
  .selectAddress extends ${styles.dropdown} {
    width: 70%;
    float: left;
    text-align: center;
  }
  .instanceContainer extends ${styles.displayBox}  {
    display: flex;
    flex-direction: column;
    background-color: ${styles.colors.lightBlue};
    margin-top: 2%;
  }
  .container extends ${styles.displayBox} {
    margin-top: 2%;
  }
  .contractNames extends ${styles.dropdown} {
    height: 32px;
    font-size: 12px;
    width: 100%;
    font-weight: bold;
    background-color: ${styles.colors.lightGrey}
  }
  .buttons {
    display: flex;
    cursor: pointer;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    font-size: 12px;
  }
  .button {
    display: flex;
    align-items: flex-end;
    margin-top: 2%;
  }
  .atAddress extends ${styles.button} {
    background-color: ${styles.colors.green};
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .create extends ${styles.button} {
    background-color: ${styles.colors.lightRed};
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .input extends ${styles.inputField} {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    width: 75%;
    font-size: 10px;
    padding-left: 10px;
  }
  .noInstancesText extends ${styles.displayBox} {
    text-align: center;
    color: ${styles.colors.lightGrey};
    font-style: italic;
  }
  .legend extends ${styles.displayBox} {
    border-radius: 5px;
    display: flex;
    justify-content: center;
    padding: 15px 8px;
    word-break: normal;
    flex-wrap: wrap;
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
    color: #9DC1F5;
    margin-right: .3em;
  }
`

module.exports = runTab

var instanceContainer = yo`<div class="${css.instanceContainer}"></div>`
var noInstancesText = yo`<div class="${css.noInstancesText}">No Contract Instances.</div>`

function runTab (container, appAPI, appEvents, opts) {
  var el = yo`
  <div class="${css.runTabView}" id="runTabView">
    ${settings(appAPI, appEvents)}
    ${legend()}
    ${contractDropdown(appAPI, appEvents, instanceContainer)}
    ${instanceContainer}
  </div>
  `
  container.appendChild(el)

  // DROPDOWN
  var selectExEnv = el.querySelector('#selectExEnvOptions')
  selectExEnv.addEventListener('change', function (event) {
    if (!appAPI.executionContextChange(selectExEnv.options[selectExEnv.selectedIndex].value)) {
      selectExEnv.value = appAPI.executionContextProvider()
    }
    fillAccountsList(appAPI, el)
    instanceContainer.innerHTML = '' // clear the instances list
    instanceContainer.appendChild(noInstancesText)
  })
  selectExEnv.value = appAPI.executionContextProvider()
  fillAccountsList(appAPI, el)
  setInterval(() => { updateAccountBalances(container, appAPI) }, 1000)
}


function fillAccountsList (appAPI, container) {
  var $txOrigin = $(container.querySelector('#txorigin'))
  $txOrigin.empty()
  appAPI.udapp().getAccounts((err, accounts) => {
    if (err) { console.log(err) }
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
    section CONTRACT DROPDOWN and BUTTONS
------------------------------------------------ */

function contractDropdown (appAPI, appEvents, instanceContainer) {
  instanceContainer.appendChild(noInstancesText)

  appEvents.compiler.register('compilationFinished', function (success, data, source) {
    getContractNames(success, data)
  })

  var atAddressButtonInput = yo`<input class="${css.input} ataddressinput" placeholder="Enter contract's address - i.e. 0x60606..." title="atAddress" />`
  var createButtonInput = yo`<input class="${css.input}" placeholder="" title="create" />`
  var selectContractNames = yo`<select class="${css.contractNames}" disabled></select>`
  var el = yo`
    <div class="${css.container}">
      ${selectContractNames}
      <div class="${css.buttons}">
        <div class="${css.button}">
          <div class="${css.atAddress}" onclick=${function () { loadFromAddress(appAPI) }}>At Address</div>
          ${atAddressButtonInput}
        </div>
        <div class="${css.button}">
          <div class="${css.create}" onclick=${function () { createInstance() }} >Create</div>
          ${createButtonInput}
        </div>
      </div>
    </div>
  `

  function setInputParamsPlaceHolder () {
    createButtonInput.value = ''
    if (appAPI.getContracts()) {
      var contract = appAPI.getContracts()[selectContractNames.children[selectContractNames.selectedIndex].innerText]
      var ctrabi = txHelper.getConstructorInterface(contract.interface)
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

  var init = false
  // ADD BUTTONS AT ADDRESS AND CREATE
  function createInstance () {
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    var contracts = appAPI.getContracts()
    var contract = appAPI.getContracts()[contractNames.children[contractNames.selectedIndex].innerText]
    var constructor = txHelper.getConstructorInterface(contract.interface)
    var args = createButtonInput.value
    txFormat.buildData(contract, contracts, true, constructor, args, appAPI.udapp(), appAPI.executionContext(), (error, data) => {
      if (!error) {
        txExecution.createContract(data, appAPI.udapp(), (error, txResult) => {
          // TODO here should send the result to the dom-console
          console.log('Contract creation', error, txResult)
          var address = appAPI.executionContext().isVM() ? txResult.result.createdAddress : txResult.result.contractAddress
          if (!init) {
            instanceContainer.innerHTML = ''
            init = true
          }
          instanceContainer.appendChild(appAPI.udapp().renderInstance(contract, address, selectContractNames.value))
        })
      } else {
        alert(error)
      }
    })
  }

  function loadFromAddress (appAPI) {
    if (!init) {
      instanceContainer.innerHTML = ''
      init = true
    }
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    var contract = appAPI.getContracts()[contractNames.children[contractNames.selectedIndex].innerText]
    var address = atAddressButtonInput.value
    instanceContainer.appendChild(appAPI.udapp().renderInstance(contract, address, selectContractNames.value))
  }

  // GET NAMES OF ALL THE CONTRACTS
  function getContractNames (success, data) {
    var contractNames = document.querySelector(`.${css.contractNames.classNames[0]}`)
    contractNames.innerHTML = ''
    if (success) {
      selectContractNames.removeAttribute('disabled')
      for (var name in data.contracts) {
        contractNames.appendChild(yo`<option>${name}</option>`)
      }
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
function settings (appAPI, appEvents) {
  // COPY ADDRESS
  function copyAddress () {
    copy(document.querySelector('#runTabView #txorigin').value)
  }

  // SETTINGS HTML
  var el = yo`
    <div class="${css.settings}">
      <div class="${css.crow}">
        <div id="selectExEnv" class="${css.col1_1}">
          Environment
        </div>
        <select id="selectExEnvOptions" class="${css.select}">
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
      </div>
      <div class="${css.crow}">
        <div class="${css.col1_1}">Account</div>
        <select name="txorigin" class="${css.selectAddress}" id="txorigin"></select>
        <i title="Copy Address" class="copytxorigin fa fa-clipboard ${css.copyaddress}" onclick=${copyAddress} aria-hidden="true"></i>
      </div>
      <div class="${css.crow}">
        <div class="${css.col1_1}">Gas limit</div>
        <input type="number" class="${css.col2}" id="gasLimit" value="3000000">
      </div>
      <div class="${css.crow} hide">
      <div class="${css.col1_1}">Gas Price</div>
        <input type="number" class="${css.col2}" id="gasPrice" value="0">
      </div>
      <div class="${css.crow}">
      <div class="${css.col1_1}">Value</div>
        <input type="text" class="${css.col2}" id="value" value="0" title="(e.g. .7 ether ...)">
      </div>
    </div>
  `

  // EVENTS
  appEvents.udapp.register('transactionExecuted', (to, data, lookupOnly, txResult) => {
    if (!lookupOnly) el.querySelector('#value').value = '0'
  })

  return el
}

/* ------------------------------------------------
              section  LEGEND
------------------------------------------------ */
function legend () {
  var el =
  yo`
    <div class="${css.legend}">
      <div class="${css.item}"><i class="fa fa-circle ${css.transact}" aria-hidden="true"></i>Transact</div/>
      <div class="${css.item}"><i class="fa fa-circle ${css.payable}" aria-hidden="true"></i>Transact(Payable)</div/>
      <div class="${css.item}"><i class="fa fa-circle ${css.call}" aria-hidden="true"></i>Call</div/>
    </div>
  `
  return el
}
