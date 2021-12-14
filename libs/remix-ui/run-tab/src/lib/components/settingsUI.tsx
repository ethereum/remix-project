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

  // /**
  //  * generate a value used by the env dropdown list.
  //  * @return {String} - can return 'vm-berlin, 'vm-london', 'injected' or 'web3'
  //  */
  // _getProviderDropdownValue () {
  //   const provider = this.blockchain.getProvider()
  //   const fork = this.blockchain.getCurrentFork()
  //   return provider === 'vm' ? provider + '-' + fork : provider
  // }

  return (
    <div className="udapp_settings">
      <EnvironmentUI setWeb3Endpoint={props.setWeb3Endpoint} selectedEnv={props.selectExEnv} providers={props.providers} setExecutionContext={props.setExecutionContext} externalEndpoint={props.externalEndpoint} />
      <NetworkUI networkName={props.networkName} />
      <AccountUI personalMode={props.personalMode} selectExEnv={props.selectExEnv} accounts={props.accounts} setAccount={props.setAccount} createNewBlockchainAccount={props.createNewBlockchainAccount} setPassphrase={props.setPassphrase} setMatchPassphrase={props.setMatchPassphrase} tooltip={props.tooltip} modal={props.modal} signMessageWithAddress={props.signMessageWithAddress} passphrase={props.passphrase} />
      <GasPriceUI gasLimit={props.gasLimit} setGasFee={props.setGasFee} />
      <ValueUI setUnit={props.setUnit} sendValue={props.sendValue} sendUnit={props.sendUnit} />
    </div>
  )
}
