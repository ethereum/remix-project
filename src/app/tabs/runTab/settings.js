const $ = require('jquery')
const yo = require('yo-yo')
const remixLib = require('remix-lib')
const EventManager = remixLib.EventManager
const css = require('../styles/run-tab-styles')
const copyToClipboard = require('../../ui/copy-to-clipboard')
const modalDialogCustom = require('../../ui/modal-dialog-custom')
const addTooltip = require('../../ui/tooltip')
const helper = require('../../../lib/helper.js')
const globalRegistry = require('../../../global/registry')

class SettingsUI {

  constructor (settings) {
    this.settings = settings
    this.event = new EventManager()
    this._components = {}

    this.settings.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
      if (error) return
      if (!lookupOnly) this.el.querySelector('#value').value = '0'
      this.updateAccountBalances()
    })

    this._components.registry = globalRegistry
    this._deps = {
      networkModule: this._components.registry.get('network').api
    }

    setInterval(() => {
      this.updateAccountBalances()
    }, 10 * 1000)

    this.accountListCallId = 0
    this.loadedAccounts = {}
  }

  updateAccountBalances () {
    if (!this.el) return
    var accounts = $(this.el.querySelector('#txorigin')).children('option')
    accounts.each((index, account) => {
      this.settings.getAccountBalanceForAddress(account.value, (err, balance) => {
        if (err) return
        account.innerText = helper.shortenAddress(account.value, balance)
      })
    })
  }

  render () {
    this.netUI = yo`<span class="${css.network} badge badge-secondary"></span>`

    var environmentEl = yo`
      <div class="${css.crow}">
        <div id="selectExEnv" class="${css.col1_1}">
          Environment
        </div>
        <div class=${css.environment}>
          <select id="selectExEnvOptions" onchange=${() => { this.updateNetwork() }} class="form-control ${css.select}">
            <option id="vm-mode"
              title="Execution environment does not connect to any node, everything is local and in memory only."
              value="vm" checked name="executionContext"> JavaScript VM
            </option>
            <option id="injected-mode"
              title="Execution environment has been provided by Metamask or similar provider."
              value="injected" checked name="executionContext"> Injected Web3
            </option>
            <option id="web3-mode"
              title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
              If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
              value="web3" name="executionContext"> Web3 Provider
            </option>
          </select>
          <a href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md" target="_blank"><i class="${css.infoDeployAction} fas fa-info"></i></a>
        </div>
      </div>
    `
    const networkEl = yo`
    <div class="${css.crow}">
        <div class="${css.col1_1}">
        </div>
        <div class="${css.environment}">
          ${this.netUI}
        </div>
      </div>
    `
    const accountEl = yo`
      <div class="${css.crow}">
        <div class="${css.col1_1}">
          Account
          <i class="fas fa-plus-circle ${css.icon}" aria-hidden="true" onclick=${this.newAccount.bind(this)} title="Create a new account"></i>
        </div>
        <div class=${css.account}>
          <select name="txorigin" class="form-control ${css.select}" id="txorigin"></select>
          ${copyToClipboard(() => document.querySelector('#runTabView #txorigin').value)}
          <i class="fas fa-edit ${css.icon}" aria-hiden="true" onclick=${this.signMessage.bind(this)} title="Sign a message using this account key"></i>
        </div>
      </div>
    `

    const gasPriceEl = yo`
      <div class="${css.crow}">
        <div class="${css.col1_1}">Gas limit</div>
        <input type="number" class="form-control ${css.gasNval} ${css.col2}" id="gasLimit" value="3000000">
      </div>
    `

    const valueEl = yo`
      <div class="${css.crow}">
        <div class="${css.col1_1}">Value</div>
        <div class="${css.gasValueContainer}">
          <input type="text" class="form-control ${css.gasNval} ${css.col2}" id="value" value="0" title="Enter the value and choose the unit">
          <select name="unit" class="form-control ${css.gasNvalUnit} ${css.col2_2}" id="unit">
            <option data-unit="wei">wei</option>
            <option data-unit="gwei">gwei</option>
            <option data-unit="finney">finney</option>
            <option data-unit="ether">ether</option>
          </select>
        </div>
      </div>
    `

    const el = yo`
      <div class="${css.settings}">
        ${environmentEl}
        ${networkEl}
        ${accountEl}
        ${gasPriceEl}
        ${valueEl}
      </div>
    `

    var selectExEnv = environmentEl.querySelector('#selectExEnvOptions')
    this.setDropdown(selectExEnv)

    this.settings.event.register('contextChanged', (context, silent) => {
      this.setFinalContext()
    })

    setInterval(() => {
      this.updateNetwork()
      this.fillAccountsList()
    }, 5000)

    this.el = el
    return el
  }

  setDropdown (selectExEnv) {
    this.selectExEnv = selectExEnv

    this.settings.event.register('addProvider', (network) => {
      selectExEnv.appendChild(yo`<option
        title="Manually added environment: ${network.url}"
        value="${network.name}"
        name="executionContext"
      >
        ${network.name}
      </option>`)
      addTooltip(`${network.name} [${network.url}] added`)
    })

    this.settings.event.register('removeProvider', (name) => {
      var env = selectExEnv.querySelector(`option[value="${name}"]`)
      if (env) {
        selectExEnv.removeChild(env)
        addTooltip(`${name} removed`)
      }
    })

    selectExEnv.addEventListener('change', (event) => {
      let context = selectExEnv.options[selectExEnv.selectedIndex].value
      this.settings.changeExecutionContext(context, () => {
        modalDialogCustom.confirm('External node request', 'Are you sure you want to connect to an ethereum node?', () => {
          modalDialogCustom.prompt('External node request', 'Web3 Provider Endpoint', 'http://localhost:8545', (target) => {
            this.settings.setProviderFromEndpoint(target, context, (alertMsg) => {
              if (alertMsg) {
                modalDialogCustom.alert(alertMsg)
              }
              this.setFinalContext()
            })
          }, this.setFinalContext.bind(this))
        }, this.setFinalContext.bind(this))
      }, (alertMsg) => {
        modalDialogCustom.alert(alertMsg)
      }, this.setFinalContext.bind(this))
    })

    selectExEnv.value = this.settings.getProvider()
  }

  setFinalContext () {
    // set the final context. Cause it is possible that this is not the one we've originaly selected
    this.selectExEnv.value = this.settings.getProvider()
    this.event.trigger('clearInstance', [])
    this.updateNetwork()
    this.fillAccountsList()
  }

  newAccount () {
    this.settings.newAccount(
      (cb) => {
        modalDialogCustom.promptPassphraseCreation((error, passphrase) => {
          if (error) {
            return modalDialogCustom.alert(error)
          }
          cb(passphrase)
        }, () => {})
      },
      (error, address) => {
        if (error) {
          return addTooltip('Cannot create an account: ' + error)
        }
        addTooltip(`account ${address} created`)
      }
    )
  }

  signMessage () {
    this.settings.getAccounts((err, accounts) => {
      if (err) {
        return addTooltip(`Cannot get account list: ${err}`)
      }

      var signMessageDialog = { 'title': 'Sign a message', 'text': 'Enter a message to sign', 'inputvalue': 'Message to sign' }
      var $txOrigin = this.el.querySelector('#txorigin')
      var account = $txOrigin.selectedOptions[0].value

      var promptCb = (passphrase) => {
        modalDialogCustom.promptMulti(signMessageDialog, (message) => {
          this.settings.signMessage(message, account, passphrase, (err, msgHash, signedData) => {
            if (err) {
              return addTooltip(err)
            }
            modalDialogCustom.alert(yo`<div><b>hash:</b>${msgHash}<br><b>signature:</b>${signedData}</div>`)
          })
        }, false)
      }

      if (this.settings.isWeb3Provider()) {
        return modalDialogCustom.promptPassphrase('Passphrase to sign a message', 'Enter your passphrase for this account to sign the message', '', promptCb, false)
      }
      promptCb()
    })
  }

  updateNetwork () {
    this.settings.updateNetwork((err, {id, name} = {}) => {
      if (err) {
        this.netUI.innerHTML = 'can\'t detect network '
        return
      }
      let network = this._deps.networkModule.getNetworkProvider
      this.netUI.innerHTML = (network() !== 'vm') ? `${name} (${id || '-'}) network` : ''
    })
  }

  // TODO: unclear what's the goal of accountListCallId, feels like it can be simplified
  fillAccountsList () {
    this.accountListCallId++
    var callid = this.accountListCallId
    var txOrigin = this.el.querySelector('#txorigin')
    this.settings.getAccounts((err, accounts) => {
      if (this.accountListCallId > callid) return
      this.accountListCallId++
      if (err) { addTooltip(`Cannot get account list: ${err}`) }
      for (var loadedaddress in this.loadedAccounts) {
        if (accounts.indexOf(loadedaddress) === -1) {
          txOrigin.removeChild(txOrigin.querySelector('option[value="' + loadedaddress + '"]'))
          delete this.loadedAccounts[loadedaddress]
        }
      }
      for (var i in accounts) {
        var address = accounts[i]
        if (!this.loadedAccounts[address]) {
          txOrigin.appendChild(yo`<option value="${address}" >${address}</option>`)
          this.loadedAccounts[address] = 1
        }
      }
      txOrigin.setAttribute('value', accounts[0])
    })
  }

}

module.exports = SettingsUI
