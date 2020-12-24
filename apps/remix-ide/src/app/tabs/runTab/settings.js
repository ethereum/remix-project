// import { EnvironmentSelector, AccountSelector, GasPrice, ValueSelector } from '@remix-ui/debugger-ui' // eslint-disable-line
import { Settings } from '@remix-ui/debugger-ui' // eslint-disable-line
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'

const $ = require('jquery')
const yo = require('yo-yo')
const remixLib = require('@remix-project/remix-lib')
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
    }, 1000)

    this.accountListCallId = 0
    this.loadedAccounts = {}
  }

  updateAccountBalances () {
    if (!this.el) return
    var accounts = $(this.el.querySelector('#txorigin')).children('option')
    accounts.each((index, account) => {
      this.blockchain.getBalanceInEther(account.value, (err, balance) => {
        if (err) return
        const updated = helper.shortenAddress(account.value, balance)
        if (updated !== account.innerText) { // check if the balance has been updated and update UI accordingly.
          account.innerText = updated
        }
      })
    })
  }

  render () {
    var el = yo`<span></span>`

    ReactDOM.render(
      <Settings updateNetwork={this.updateNetwork.bind(this)} updatePlusButton={this.updatePlusButton.bind(this)} newAccount={this.newAccount.bind(this)} signMessage={this.signMessage.bind(this)} copyToClipboard={copyToClipboard} />
      , el)

    this.el = el

    var selectExEnv = el.querySelector('#selectExEnvOptions')
    this.setDropdown(selectExEnv)

    this.blockchain.event.register('contextChanged', (context, silent) => {
      this.setFinalContext()
    })

    setInterval(() => {
      this.updateNetwork()
    }, 1000)

    this.fillAccountsList()
    return el
  }

  setDropdown (selectExEnv) {
    this.selectExEnv = selectExEnv

    const addProvider = (network) => {
      selectExEnv.appendChild(yo`<option
        title="provider name: ${network.name}"
        value="${network.name}"
        name="executionContext"
      >
        ${network.name}
      </option>`)
      addTooltip(yo`<span><b>${network.name}</b> provider added</span>`)
    }

    const removeProvider = (name) => {
      var env = selectExEnv.querySelector(`option[value="${name}"]`)
      if (env) {
        selectExEnv.removeChild(env)
        addTooltip(yo`<span><b>${name}</b> provider removed</span>`)
      }
    }
    this.blockchain.event.register('addProvider', provider => addProvider(provider))
    this.blockchain.event.register('removeProvider', name => removeProvider(name))

    selectExEnv.addEventListener('change', (event) => {
      const context = selectExEnv.options[selectExEnv.selectedIndex].value
      this.blockchain.changeExecutionContext(context, () => {
        modalDialogCustom.prompt('External node request', this.web3ProviderDialogBody(), 'http://127.0.0.1:8545', (target) => {
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
    const plusBtn = document.getElementById('remixRunPlus')
    const plusTitle = document.getElementById('remixRunPlusWraper')
    switch (this.selectExEnv.value) {
      case 'injected':
        plusBtn.classList.add(css.disableMouseEvents)
        plusTitle.title = "Unfortunately it's not possible to create an account using injected web3. Please create the account directly from your provider (i.e metamask or other of the same type)."

        break
      case 'vm':
        plusBtn.classList.remove(css.disableMouseEvents)
        plusTitle.title = 'Create a new account'

        break

      case 'web3':
        this.onPersonalChange()

        break
      default: {
        plusBtn.classList.add(css.disableMouseEvents)
        plusTitle.title = `Unfortunately it's not possible to create an account using an external wallet (${this.selectExEnv.value}).`
      }
    }
  }

  onPersonalChange () {
    const plusBtn = document.getElementById('remixRunPlus')
    const plusTitle = document.getElementById('remixRunPlusWraper')
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

      var signMessageDialog = { title: 'Sign a message', text: 'Enter a message to sign', inputvalue: 'Message to sign' }
      var $txOrigin = this.el.querySelector('#txorigin')
      if (!$txOrigin.selectedOptions[0] && (this.blockchain.isInjectedWeb3() || this.blockchain.isWeb3Provider())) {
        return addTooltip('Account list is empty, please make sure the current provider is properly connected to remix')
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

  updateNetwork (cb) {
    this.blockchain.updateNetwork((err, { id, name } = {}) => {
      if (!cb) return
      if (err) {
          return cb('can\'t detect network ')
      }
      const network = this._components.networkModule.getNetworkProvider.bind(this._components.networkModule)
      cb((network() !== 'vm') ? `${name} (${id || '-'}) network` : '')
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
