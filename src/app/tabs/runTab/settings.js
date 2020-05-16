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

  constructor (blockchain, networkModule) {
    this.blockchain = blockchain
    this.event = new EventManager()
    this._components = {}

    this.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
      if (error) return
      if (!lookupOnly) this.el.querySelector('#value').value = '0'
      this.updateAccountBalances()
    })
    this._components = {
      registry: globalRegistry,
      networkModule: networkModule
    }
    this._components.registry = globalRegistry
    this._deps = {
      config: this._components.registry.get('config').api
    }

    this._deps.config.events.on('settings/personal-mode_changed', this.onPersonalChange.bind(this))

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
      this.blockchain.getBalanceInEther(account.value, (err, balance) => {
        if (err) return
        account.innerText = helper.shortenAddress(account.value, balance)
      })
    })
  }

  render () {
    this.netUI = yo`<span class="${css.network} badge badge-secondary"></span>`

    var environmentEl = yo`
      <div class="${css.crow}">
        <label id="selectExEnv" class="${css.settingsLabel}">
          Environment
        </label>
        <div class="${css.environment}">
          <select id="selectExEnvOptions" data-id="settingsSelectEnvOptions" onchange=${() => { this.updateNetwork() }} class="form-control ${css.select} custom-select">
            <option id="vm-mode"
              title="Execution environment does not connect to any node, everything is local and in memory only."
              value="vm" name="executionContext"> JavaScript VM
            </option>
            <option id="injected-mode"
              title="Execution environment has been provided by Metamask or similar provider."
              value="injected" name="executionContext"> Injected Web3
            </option>
            <option id="web3-mode" data-id="settingsWeb3Mode"
              title="Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse!
              If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http."
              value="web3" name="executionContext"> Web3 Provider
            </option>
          </select>
          <a href="https://remix-ide.readthedocs.io/en/latest/run.html#run-setup" target="_blank"><i class="${css.infoDeployAction} ml-2 fas fa-info" title="check out docs to setup Environment"></i></a>
        </div>
      </div>
    `
    const networkEl = yo`
    <div class="${css.crow}">
        <div class="${css.settingsLabel}">
        </div>
        <div class="${css.environment}" data-id="settingsNetworkEnv">
          ${this.netUI}
        </div>
      </div>
    `
    const accountEl = yo`
      <div class="${css.crow}">
        <label class="${css.settingsLabel}">
          Account
          <span id="remixRunPlusWraper" title="Create a new account" onload=${this.updatePlusButton.bind(this)}>
            <i id="remixRunPlus" class="fas fa-plus-circle ${css.icon}" aria-hidden="true" onclick=${this.newAccount.bind(this)}"></i>
          </span>
        </label>
        <div class="${css.account}">
          <select data-id="runTabSelectAccount" name="txorigin" class="form-control ${css.select} custom-select pr-4" id="txorigin"></select>
          <div style="margin-left: -5px;">${copyToClipboard(() => document.querySelector('#runTabView #txorigin').value)}</div>
          <i id="remixRunSignMsg" data-id="settingsRemixRunSignMsg" class="mx-1 fas fa-edit ${css.icon}" aria-hidden="true" onclick=${this.signMessage.bind(this)} title="Sign a message using this account key"></i>
        </div>
      </div>
    `

    const gasPriceEl = yo`
      <div class="${css.crow}">
        <label class="${css.settingsLabel}">Gas limit</label>
        <input type="number" class="form-control ${css.gasNval} ${css.col2}" id="gasLimit" value="3000000">
      </div>
    `

    const valueEl = yo`
      <div class="${css.crow}">
        <label class="${css.settingsLabel}">Value</label>
        <div class="${css.gasValueContainer}">
          <input type="text" class="form-control ${css.gasNval} ${css.col2}" id="value" value="0" title="Enter the value and choose the unit">
          <select name="unit" class="form-control p-1 ${css.gasNvalUnit} ${css.col2_2} custom-select" id="unit">
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

    this.blockchain.event.register('contextChanged', (context, silent) => {
      this.setFinalContext()
    })

    setInterval(() => {
      this.updateNetwork()
    }, 5000)

    this.el = el

    this.fillAccountsList()
    return el
  }

  setDropdown (selectExEnv) {
    this.selectExEnv = selectExEnv

    this.blockchain.event.register('addProvider', (network) => {
      selectExEnv.appendChild(yo`<option
        title="Manually added environment: ${network.url}"
        value="${network.name}"
        name="executionContext"
      >
        ${network.name}
      </option>`)
      addTooltip(`${network.name} [${network.url}] added`)
    })

    this.blockchain.event.register('removeProvider', (name) => {
      var env = selectExEnv.querySelector(`option[value="${name}"]`)
      if (env) {
        selectExEnv.removeChild(env)
        addTooltip(`${name} removed`)
      }
    })

    selectExEnv.addEventListener('change', (event) => {
      let context = selectExEnv.options[selectExEnv.selectedIndex].value
      this.blockchain.changeExecutionContext(context, () => {
        modalDialogCustom.prompt('External node request', this.web3ProviderDialogBody(), 'http://localhost:8545', (target) => {
          this.blockchain.setProviderFromEndpoint(target, context, (alertMsg) => {
            if (alertMsg) addTooltip(alertMsg)
            this.setFinalContext()
          })
        }, this.setFinalContext.bind(this))
      }, (alertMsg) => {
        addTooltip(alertMsg)
      }, this.setFinalContext.bind(this))
    })

    selectExEnv.value = this.blockchain.getProvider()
  }

  web3ProviderDialogBody () {
    const thePath = '<path/to/local/folder/for/test/chain>'

    return yo`
      <div class="">
        Note: To use Geth & https://remix.ethereum.org, configure it to allow requests from Remix:(see <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank">Geth Docs on rpc server</a>)
        <div class="border p-1">geth --rpc --rpccorsdomain https://remix.ethereum.org</div>
        <br>
        To run Remix & a local Geth test node, use this command: (see <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank">Geth Docs on Dev mode</a>)
        <div class="border p-1">geth --rpc --rpccorsdomain="${window.origin}" --rpcapi web3,eth,debug,personal,net --vmdebug --datadir ${thePath} --dev console</div>
        <br>
        <br> 
        <b>WARNING:</b> It is not safe to use the --rpccorsdomain flag with a wildcard: <b>--rpccorsdomain *</b>
        <br>
        <br>For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank">Remix Docs on Web3 Provider</a>
        <br>
        <br> 
        Web3 Provider Endpoint
      </div>
    `
  }

  setFinalContext () {
    // set the final context. Cause it is possible that this is not the one we've originaly selected
    this.selectExEnv.value = this.blockchain.getProvider()
    this.event.trigger('clearInstance', [])
    this.updateNetwork()
    this.updatePlusButton()
  }

  updatePlusButton () {
    // enable/disable + button
    let plusBtn = document.getElementById('remixRunPlus')
    let plusTitle = document.getElementById('remixRunPlusWraper')
    switch (this.selectExEnv.value) {
      case 'injected': {
        plusBtn.classList.add(css.disableMouseEvents)
        plusTitle.title = "Unfortunately it's not possible to create an account using injected web3. Please create the account directly from your provider (i.e metamask or other of the same type)."
      }
        break
      case 'vm': {
        plusBtn.classList.remove(css.disableMouseEvents)
        plusTitle.title = 'Create a new account'
      }
        break
      case 'web3': {
        this.onPersonalChange()
      }
        break
      default:
    }
  }

  onPersonalChange () {
    let plusBtn = document.getElementById('remixRunPlus')
    let plusTitle = document.getElementById('remixRunPlusWraper')
    if (!this._deps.config.get('settings/personal-mode')) {
      plusBtn.classList.add(css.disableMouseEvents)
      plusTitle.title = 'Creating an account is possible only in Personal mode. Please go to Settings to enable it.'
    } else {
      plusBtn.classList.remove(css.disableMouseEvents)
      plusTitle.title = 'Create a new account'
    }
  }

  newAccount () {
    this.blockchain.newAccount(
      '',
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
    this.blockchain.getAccounts((err, accounts) => {
      if (err) {
        return addTooltip(`Cannot get account list: ${err}`)
      }

      var signMessageDialog = { 'title': 'Sign a message', 'text': 'Enter a message to sign', 'inputvalue': 'Message to sign' }
      var $txOrigin = this.el.querySelector('#txorigin')
      if (!$txOrigin.selectedOptions[0] && (this.blockchain.isInjectedWeb3() || this.blockchain.isWeb3Provider())) {
        return addTooltip(`Account list is empty, please make sure the current provider is properly connected to remix`)
      }

      var account = $txOrigin.selectedOptions[0].value

      var promptCb = (passphrase) => {
        const modal = modalDialogCustom.promptMulti(signMessageDialog, (message) => {
          this.blockchain.signMessage(message, account, passphrase, (err, msgHash, signedData) => {
            if (err) {
              return addTooltip(err)
            }
            modal.hide()
            modalDialogCustom.alert(yo`
              <div>
                <b>hash:</b><br>
                <span id="remixRunSignMsgHash" data-id="settingsRemixRunSignMsgHash">${msgHash}</span>
                <br><b>signature:</b><br>
                <span id="remixRunSignMsgSignature" data-id="settingsRemixRunSignMsgSignature">${signedData}</span>
              </div>
            `)
          })
        }, false)
      }

      if (this.blockchain.isWeb3Provider()) {
        return modalDialogCustom.promptPassphrase(
          'Passphrase to sign a message',
          'Enter your passphrase for this account to sign the message',
          '',
          promptCb,
          false
        )
      }
      promptCb()
    })
  }

  updateNetwork () {
    this.blockchain.updateNetwork((err, {id, name} = {}) => {
      if (err) {
        this.netUI.innerHTML = 'can\'t detect network '
        return
      }
      let network = this._components.networkModule.getNetworkProvider.bind(this._components.networkModule)
      this.netUI.innerHTML = (network() !== 'vm') ? `${name} (${id || '-'}) network` : ''
    })
    this.fillAccountsList()
  }

  // TODO: unclear what's the goal of accountListCallId, feels like it can be simplified
  fillAccountsList () {
    this.accountListCallId++
    var callid = this.accountListCallId
    var txOrigin = this.el.querySelector('#txorigin')
    this.blockchain.getAccounts((err, accounts) => {
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
