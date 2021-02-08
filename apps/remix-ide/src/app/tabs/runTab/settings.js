import { Settings } from '@remix-ui/run-tab' // eslint-disable-line
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'

const asyncJS = require('async')
const yo = require('yo-yo')
const remixLib = require('@remix-project/remix-lib')
const EventManager = remixLib.EventManager
const copyToClipboard = require('../../ui/copy-to-clipboard')
const modalDialogCustom = require('../../ui/modal-dialog-custom')
const addTooltip = require('../../ui/tooltip')
const helper = require('../../../lib/helper.js')
const globalRegistry = require('../../../global/registry')

const defaultOptions = [
  { value: 'vm', name: 'JavaScript VM', title: 'Execution environment does not connect to any node, everything is local and in memory only.' },
  { value: 'injected', name: 'Injected Web3', title: 'Execution environment has been provided by Metamask or similar provider.' },
  { value: 'web3', name: 'Web3 Provider', title: 'Execution environment connects to node at localhost (or via IPC if available), transactions will be sent to the network and can cause loss of money or worse! If this page is served via https and you access your node via http, it might not work. In this case, try cloning the repository and serving it via http.' }
]

class SettingsUI {
  constructor (blockchain, networkModule) {
    this.blockchain = blockchain
    this.event = new EventManager()
    this._components = {}
    this.options = defaultOptions
    this.accounts = []

    this.blockchain.event.register('transactionExecuted', (error, from, to, data, lookupOnly, txResult) => {
      if (!lookupOnly) this.el.querySelector('#value').value = 0
      if (error) return
      this.updateAccountsAndBalances()
    })
    this._components = {
      registry: globalRegistry,
      networkModule: networkModule
    }
    this._components.registry = globalRegistry
    this._deps = {
      config: this._components.registry.get('config').api
    }

    this._deps.config.events.on('settings/personal-mode_changed', this.renderSettings.bind(this))
    setInterval(this.updateAccountsAndBalances.bind(this), 2000)
  }

  renderSettings () {
    const personalModeChecked = this._deps.config.get('settings/personal-mode')
    const selectedProvider = this.blockchain.getProvider()

    ReactDOM.render(<Settings accounts={this.accounts} options={this.options} selectedProvider={selectedProvider} personalModeChecked={personalModeChecked} updateNetwork={this.updateNetwork.bind(this)} newAccount={this.newAccount.bind(this)} signMessage={this.signMessage.bind(this)} copyToClipboard={copyToClipboard} />, this.el)
  }

  render () {
    this.el = yo`<span></span>`

    this.renderSettings()

    this.blockchain.event.register('addProvider', (network) => {
      this.options.push({ title: `provider name: ${network.name}`, value: `${network.name}`, name: 'executionContext' })
      this.renderSettings()

      addTooltip(yo`<span><b>${network.name}</b> provider added</span>`)
    })

    this.blockchain.event.register('removeProvider', (name) => {
      this.options = this.options.filter((option) => option.name !== name)
      this.renderSettings()

      addTooltip(yo`<span><b>${name}</b> provider removed</span>`)
    })

    this.blockchain.event.register('contextChanged', this.setFinalContext.bind(this))
    setInterval(this.updateNetwork.bind(this), 1000)

    return this.el
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

  // set the final context. Cause it is possible that this is not the one we've originaly selected
  setFinalContext () {
    this.event.trigger('clearInstance', [])
    this.updateNetwork()
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

  updateNetwork (context, cb) {
    if (context) {
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
    }

    this.blockchain.updateNetwork((err, { id, name } = {}) => {
      if (!cb) return
      if (err) {
        return cb('can\'t detect network ')
      }
      const network = this._components.networkModule.getNetworkProvider.bind(this._components.networkModule)
      this.renderSettings()
      cb((network() !== 'vm') ? `${name} (${id || '-'}) network` : '')
    })
    this.updateAccountsAndBalances()
  }

  async updateAccountsAndBalances () {
    const accounts = await this.blockchain.getAccounts()
    asyncJS.map(accounts, async (address, next) => {
      this.blockchain.getBalanceInEther(address, (err, balance) => {
        if (err) { return next(err) }
        const updated = helper.shortenAddress(address, balance)
        const newAccount = { address, name: updated }
        next(null, newAccount)
      })
    }, (_err, results) => {
      this.accounts = results
      this.renderSettings()
    })
  }
}

module.exports = SettingsUI
