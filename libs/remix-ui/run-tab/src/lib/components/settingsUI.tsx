// eslint-disable-next-line no-use-before-define
import React from 'react'
import { SettingsProps } from '../types'
import { EnvironmentUI } from './environment'
import { NetworkUI } from './network'
import { AccountUI } from './account'
import { GasPriceUI } from './gasPrice'
import { ValueUI } from './value'

export function SettingsUI (props: SettingsProps) {
  // constructor () {
  //   this.blockchain = blockchain
  //   this.event = new EventManager()
  //   this._components = {}

  //   this._components = {
  //     registry: globalRegistry,
  //     networkModule: networkModule
  //   }
  //   this._components.registry = globalRegistry
  //   this._deps = {
  //     config: this._components.registry.get('config').api
  //   }

  //   this._deps.config.events.on('settings/personal-mode_changed', this.onPersonalChange.bind(this))

  //   setInterval(() => {
  //     this.updateAccountBalances()
  //   }, 1000)

  //   this.accountListCallId = 0
  //   this.loadedAccounts = {}
  // }

  // setExecutionContext (context) {
  //   this.blockchain.changeExecutionContext(context, () => {
  //     modalDialogCustom.prompt('External node request', this.web3ProviderDialogBody(), 'http://127.0.0.1:8545', (target) => {
  //       this.blockchain.setProviderFromEndpoint(target, context, (alertMsg) => {
  //         if (alertMsg) addTooltip(alertMsg)
  //         this.setFinalContext()
  //       })
  //     }, this.setFinalContext.bind(this))
  //   }, (alertMsg) => {
  //     addTooltip(alertMsg)
  //   }, this.setFinalContext.bind(this))
  // }

  // web3ProviderDialogBody () {
  //   const thePath = '<path/to/local/folder/for/test/chain>'

  //   return yo`
  //     <div class="">
  //       Note: To use Geth & https://remix.ethereum.org, configure it to allow requests from Remix:(see <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank">Geth Docs on rpc server</a>)
  //       <div class="border p-1">geth --http --http.corsdomain https://remix.ethereum.org</div>
  //       <br>
  //       To run Remix & a local Geth test node, use this command: (see <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank">Geth Docs on Dev mode</a>)
  //       <div class="border p-1">geth --http --http.corsdomain="${window.origin}" --http.api web3,eth,debug,personal,net --vmdebug --datadir ${thePath} --dev console</div>
  //       <br>
  //       <br>
  //       <b>WARNING:</b> It is not safe to use the --http.corsdomain flag with a wildcard: <b>--http.corsdomain *</b>
  //       <br>
  //       <br>For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank">Remix Docs on Web3 Provider</a>
  //       <br>
  //       <br>
  //       Web3 Provider Endpoint
  //     </div>
  //   `
  // }

  // /**
  //  * generate a value used by the env dropdown list.
  //  * @return {String} - can return 'vm-berlin, 'vm-london', 'injected' or 'web3'
  //  */
  // _getProviderDropdownValue () {
  //   const provider = this.blockchain.getProvider()
  //   const fork = this.blockchain.getCurrentFork()
  //   return provider === 'vm' ? provider + '-' + fork : provider
  // }

  // setFinalContext () {
  //   // set the final context. Cause it is possible that this is not the one we've originaly selected
  //   this.selectExEnv.value = this._getProviderDropdownValue()
  //   this.event.trigger('clearInstance', [])
  //   this.updatePlusButton()
  // }

  // onPersonalChange () {
  //   const plusBtn = document.getElementById('remixRunPlus')
  //   const plusTitle = document.getElementById('remixRunPlusWraper')
  //   if (!this._deps.config.get('settings/personal-mode')) {
  //     plusBtn.classList.add(css.disableMouseEvents)
  //     plusTitle.title = 'Creating an account is possible only in Personal mode. Please go to Settings to enable it.'
  //   } else {
  //     plusBtn.classList.remove(css.disableMouseEvents)
  //     plusTitle.title = 'Create a new account'
  //   }
  // }

  // getSelectedAccount () {
  //   return this.el.querySelector('#txorigin').selectedOptions[0].value
  // }

  // getEnvironment () {
  //   return this.blockchain.getProvider()
  // }

  return (
  // this.blockchain.event.register('contextChanged', (context, silent) => {
  //   this.setFinalContext()
  // })

  // this.blockchain.event.register('networkStatus', ({ error, network }) => {
  //   if (error) {
  //     this.netUI.innerHTML = 'can\'t detect network '
  //     return
  //   }
  //   const networkProvider = this._components.networkModule.getNetworkProvider.bind(this._components.networkModule)
  //   this.netUI.innerHTML = (networkProvider() !== 'vm') ? `${network.name} (${network.id || '-'}) network` : ''
  // })

  // setInterval(() => {
  //   this.fillAccountsList()
  // }, 1000)

  // this.el = el

    // this.fillAccountsList()
    // return el
    <div className="udapp_settings">
      <EnvironmentUI updateExEnv={props.updateExEnv} />
      <NetworkUI />
      <AccountUI selectExEnv={props.selectExEnv} accounts={props.accounts} />
      <GasPriceUI />
      <ValueUI />
    </div>
  )
}
