/* global */
'use strict'

var $ = require('jquery')
var remixLib = require('remix-lib')
var yo = require('yo-yo')
var txHelper = require('./app/execution/txHelper')
var helper = require('./lib/helper')
var executionContext = require('./execution-context')
var copyToClipboard = require('./app/ui/copy-to-clipboard')

// -------------- styling ----------------------
var csjs = require('csjs-inject')
var styleGuide = remixLib.ui.themeChooser
var styles = styleGuide.chooser()

var css = csjs`
  .instanceTitleContainer {
    display: flex;
    align-items: center;
  }
  .title {
    ${styles.rightPanel.runTab.titlebox_RunTab}
    display: flex;
    justify-content: end;
    align-items: center;
    font-size: 11px;
    height: 30px;
    width: 97%;
    overflow: hidden;
    word-break: break-word;
    line-height: initial;
    overflow: visible;
  }
  .titleLine {
    display: flex;
    align-items: baseline;
  }
  .titleText {
    margin-right: 1em;
    word-break: break-word;
    min-width: 230px;
  }

  .title .copy {
    color: ${styles.rightPanel.runTab.icon_AltColor_Instance_CopyToClipboard};
  }
  .instance {
    ${styles.rightPanel.runTab.box_Instance};
    margin-bottom: 10px;
    padding: 10px 15px 15px 15px;
  }
  .instance .title:before {
    content: "\\25BE";
    margin-right: 5%;
  }
  .instance.hidesub .title:before {
    content: "\\25B8";
    margin-right: 5%;
  }
  .instance.hidesub > * {
      display: none;
  }
  .instance.hidesub .title {
      display: flex;
  }
  .instance.hidesub .udappClose {
      display: flex;
  }
  .buttonsContainer {
    margin-top: 2%;
    display: flex;
    overflow: hidden;
  }
  .contractActions {
    display: flex;
  }
  .instanceButton {}
  .closeIcon {
    font-size: 12px;
    cursor: pointer;
  }
  .udappClose {
    display: flex;
    justify-content: flex-end;
  }
  .contractProperty {
    overflow: auto;
    margin-bottom: 0.4em;
  }
  .contractProperty.hasArgs input {
    width: 75%;
    padding: .36em;
  }
  .contractProperty button {
    ${styles.rightPanel.runTab.button_Create}
    min-width: 100px;
    width: 100px;
    font-size: 10px;
    margin:0;
    word-break: inherit;
  }
  .contractProperty button:disabled {
    cursor: not-allowed;
    background-color: white;
    border-color: lightgray;
  }
  .contractProperty.constant button {
    ${styles.rightPanel.runTab.button_Constant}
    min-width: 100px;
    width: 100px;
    font-size: 10px;
    margin:0;
    word-break: inherit;
    outline: none;
    width: inherit;
  }
  .contractProperty input {
    display: none;
  }
  .contractProperty > .value {
    box-sizing: border-box;
    float: left;
    align-self: center;
    color: ${styles.appProperties.mainText_Color};
    margin-left: 4px;
  }
  .hasArgs input {
    display: block;
    border: 1px solid #dddddd;
    padding: .36em;
    border-left: none;
    padding: 8px 8px 8px 10px;
    font-size: 10px;
    height: 25px;
  }
  .hasArgs button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
  }
`

/*
  trigger debugRequested
*/
function UniversalDAppUI (udapp, opts = {}) {
  var self = this
  this.udapp = udapp

  self.el = yo`<div class=${css.udapp}></div>`
}

UniversalDAppUI.prototype.reset = function (contracts, transactionContextAPI) {
  this.el.innerHTML = ''
}

UniversalDAppUI.prototype.renderInstance = function (contract, address, contractName) {
  var abi = txHelper.sortAbiFunction(contract.abi)
  return this.renderInstanceFromABI(abi, address, contractName)
}

// TODO this function was named before "appendChild".
// this will render an instance: contract name, contract address, and all the public functions
// basically this has to be called for the "atAddress" (line 393) and when a contract creation succeed
// this returns a DOM element
UniversalDAppUI.prototype.renderInstanceFromABI = function (contractABI, address, contractName) {
  var self = this

  function remove () { instance.remove() }

  address = (address.slice(0, 2) === '0x' ? '' : '0x') + address.toString('hex')
  var instance = yo`<div class="instance ${css.instance}" id="instance${address}"></div>`
  var context = executionContext.isVM() ? 'memory' : 'blockchain'

  var shortAddress = helper.shortenAddress(address)
  var title = yo`<div class="${css.title}" onclick=${toggleClass}>
    <div class="${css.titleText}"> ${contractName} at ${shortAddress} (${context}) </div>
    ${copyToClipboard(() => address)}
  </div>`

  if (self.udapp.removable_instances) {
    var close = yo`<div class="${css.udappClose}" onclick=${remove}><i class="${css.closeIcon} fa fa-close" aria-hidden="true"></i></div>`
    instance.append(close)
  }

  function toggleClass () {
    $(instance).toggleClass(`${css.hidesub}`)
  }

  instance.appendChild(title)

  // Add the fallback function
  var fallback = txHelper.getFallbackInterface(contractABI)
  if (fallback) {
    instance.appendChild(this.getCallButton({
      funABI: fallback,
      address: address,
      contractAbi: contractABI,
      contractName: contractName
    }))
  }

  $.each(contractABI, (i, funABI) => {
    if (funABI.type !== 'function') {
      return
    }
    // @todo getData cannot be used with overloaded functions
    instance.appendChild(this.getCallButton({
      funABI: funABI,
      address: address,
      contractAbi: contractABI,
      contractName: contractName
    }))
  })

  return instance
}

// TODO this is used by renderInstance when a new instance is displayed.
// this returns a DOM element.
UniversalDAppUI.prototype.getCallButton = function (args) {
  var self = this
  // args.funABI, args.address [fun only]
  // args.contractName [constr only]
  var lookupOnly = args.funABI.constant

  var inputs = ''
  if (args.funABI.inputs) {
    inputs = txHelper.inputParametersDeclarationToString(args.funABI.inputs)
  }
  var inputField = yo`<input></input>`
  inputField.setAttribute('placeholder', inputs)
  inputField.setAttribute('title', inputs)

  var outputOverride = yo`<div class=${css.value}></div>`

  var title
  if (args.funABI.name) {
    title = args.funABI.name
  } else {
    title = '(fallback)'
  }

  var button = yo`<button onclick=${clickButton} class="${css.instanceButton}"></button>`
  button.classList.add(css.call)
  button.setAttribute('title', title)
  button.innerHTML = title

  function clickButton () {
    self.udapp.call(true, args, inputField.value, lookupOnly, (decoded) => {
      outputOverride.innerHTML = ''
      outputOverride.appendChild(decoded)
    })
  }

  var contractProperty = yo`<div class="${css.contractProperty} ${css.buttonsContainer}"></div>`
  var contractActions = yo`<div class="${css.contractActions}" ></div>`

  contractProperty.appendChild(contractActions)
  contractActions.appendChild(button)
  if (inputs.length) {
    contractActions.appendChild(inputField)
  }
  if (lookupOnly) {
    contractProperty.appendChild(outputOverride)
  }

  if (lookupOnly) {
    contractProperty.classList.add(css.constant)
    button.setAttribute('title', (title + ' - call'))
  }

  if (args.funABI.inputs && args.funABI.inputs.length > 0) {
    contractProperty.classList.add(css.hasArgs)
  }

  if (args.funABI.payable === true) {
    contractProperty.classList.add(css.payable)
    button.setAttribute('title', (title + ' - transact (payable)'))
  }

  if (!lookupOnly && args.funABI.payable === false) {
    button.setAttribute('title', (title + ' - transact (not payable)'))
  }

  return contractProperty
}

module.exports = UniversalDAppUI
