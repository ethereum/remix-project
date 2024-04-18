import React from 'react' // eslint-disable-line
import {RunTabUI} from '@remix-ui/run-tab'
import {ViewPlugin} from '@remixproject/engine-web'
import {addressToString} from '@remix-ui/helper'
import {InjectedProviderDefault} from '../providers/injected-provider-default'
import {InjectedCustomProvider} from '../providers/injected-custom-provider'
import * as packageJson from '../../../../../package.json'

const EventManager = require('../../lib/events')
const Recorder = require('../tabs/runTab/model/recorder.js')
const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'udapp',
  displayName: 'Deploy & run transactions',
  icon: 'assets/img/deployAndRun.webp',
  description: 'Execute, save and replay transactions',
  kind: 'udapp',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/run.html',
  version: packageJson.version,
  maintainedBy: 'Remix',
  permission: true,
  events: ['newTransaction'],
  methods: [
    'createVMAccount',
    'sendTransaction',
    'getAccounts',
    'pendingTransactionsCount',
    'getSettings',
    'setEnvironmentMode',
    'clearAllInstances',
    'clearAllPinnedInstances',
    'addInstance',
    'addPinnedInstance',
    'resolveContractAndAddInstance'
  ]
}

export class RunTab extends ViewPlugin {
  constructor(blockchain, config, fileManager, editor, filePanel, compilersArtefacts, networkModule, fileProvider, engine) {
    super(profile)
    this.event = new EventManager()
    this.engine = engine
    this.config = config
    this.blockchain = blockchain
    this.fileManager = fileManager
    this.editor = editor
    this.filePanel = filePanel
    this.compilersArtefacts = compilersArtefacts
    this.networkModule = networkModule
    this.fileProvider = fileProvider
    this.recorder = new Recorder(blockchain)
    this.REACT_API = {}
    this.setupEvents()
    this.el = document.createElement('div')
  }

  setupEvents() {
    this.blockchain.events.on('newTransaction', (tx, receipt) => {
      this.emit('newTransaction', tx, receipt)
    })
  }

  getSettings() {
    return new Promise((resolve, reject) => {
      resolve({
        selectedAccount: this.REACT_API.accounts.selectedAccount,
        selectedEnvMode: this.REACT_API.selectExEnv,
        networkEnvironment: this.REACT_API.networkName
      })
    })
  }

  async setEnvironmentMode(env) {
    const canCall = await this.askUserPermission('setEnvironmentMode', 'change the environment used')
    if (canCall) {
      env = typeof env === 'string' ? {context: env} : env
      this.emit('setEnvironmentModeReducer', env, this.currentRequest.from)
    }
  }

  clearAllInstances() {
    this.emit('clearAllInstancesReducer')
  }

  clearAllPinnedInstances() {
    this.emit('clearAllPinnedInstancesReducer')
  }

  addInstance(address, abi, name, contractData) {
    this.emit('addInstanceReducer', address, abi, name, contractData)
  }

  addPinnedInstance(address, abi, name, pinnedAt, filePath) {
    this.emit('addPinnedInstanceReducer', address, abi, name, pinnedAt, filePath)
  }

  createVMAccount(newAccount) {
    return this.blockchain.createVMAccount(newAccount)
  }

  sendTransaction(tx) {
    _paq.push(['trackEvent', 'udapp', 'sendTx', 'udappTransaction'])
    return this.blockchain.sendTransaction(tx)
  }

  getAccounts(cb) {
    return this.blockchain.getAccounts(cb)
  }

  pendingTransactionsCount() {
    return this.blockchain.pendingTransactionsCount()
  }

  render() {
    return (
      <div>
        <RunTabUI plugin={this} />
      </div>
    )
  }

  onReady(api) {
    this.REACT_API = api
  }

  async onInitDone() {
    const udapp = this // eslint-disable-line

    const addProvider = async (name, displayName, isInjected, isVM, fork = '', dataId = '', title = '') => {
      await this.call('blockchain', 'addProvider', {
        options: {},
        dataId,
        name,
        displayName,
        fork,
        isInjected,
        isVM,
        title,
        init: async function () {
          const options = await udapp.call(name, 'init')
          if (options) {
            this.options = options
            if (options['fork']) this.fork = options['fork']
          }
        },
        provider: {
          sendAsync (payload) {
            return udapp.call(name, 'sendAsync', payload)
          }
        }
      })
    }

    const addCustomInjectedProvider = async (event, name, networkId, urls, nativeCurrency) => {
      name = `${name} through ${event.detail.info.name}`
      await this.engine.register([new InjectedCustomProvider(event.detail.provider, name, networkId, urls, nativeCurrency)])
      await addProvider(name, name, true, false, false)
    }
    const registerInjectedProvider = async (event) => {
      console.log('registerInjectedProvider', event)
      await this.engine.register([new InjectedProviderDefault(event.detail.provider, event.detail.info.name)])
      await addProvider(event.detail.info.name, event.detail.info.name, true, false, false)

      await addCustomInjectedProvider(event, 'Optimism', '0xa', ['https://mainnet.optimism.io'])
      await addCustomInjectedProvider(event, 'Arbitrum One', '0xa4b1', ['https://arb1.arbitrum.io/rpc'])
      await addCustomInjectedProvider(event, 'SKALE Chaos Testnet', '0x50877ed6', ['https://staging-v3.skalenodes.com/v1/staging-fast-active-bellatrix'], {
        "name": "sFUEL",
        "symbol": "sFUEL",
        "decimals": 18
      })
      await addCustomInjectedProvider(event, 'Ephemery Testnet', '', ['https://arb1.arbitrum.io/rpc'])
    }

    // VM
    const titleVM = 'Execution environment is local to Remix.  Data is only saved to browser memory and will vanish upon reload.'
    await addProvider('vm-cancun', 'Remix VM (Cancun)', false, true, 'cancun', 'settingsVMCancunMode', titleVM)
    await addProvider('vm-shanghai', 'Remix VM (Shanghai)', false, true, 'shanghai', 'settingsVMShanghaiMode', titleVM)
    await addProvider('vm-paris', 'Remix VM (Paris)', false, true, 'paris', 'settingsVMParisMode', titleVM)
    await addProvider('vm-london', 'Remix VM (London)', false, true, 'london', 'settingsVMLondonMode', titleVM)
    await addProvider('vm-berlin', 'Remix VM (Berlin)', false, true, 'berlin', 'settingsVMBerlinMode', titleVM)
    await addProvider('vm-mainnet-fork', 'Remix VM - Mainnet fork', false, true, 'cancun', 'settingsVMMainnetMode', titleVM)
    await addProvider('vm-sepolia-fork', 'Remix VM - Sepolia fork', false, true, 'cancun', 'settingsVMSepoliaMode', titleVM)
    await addProvider('vm-goerli-fork', 'Remix VM - Goerli fork', false, true, 'paris', 'settingsVMGoerliMode', titleVM)
    await addProvider('vm-custom-fork', 'Remix VM - Custom fork', false, true, '', 'settingsVMCustomMode', titleVM)

    // wallet connect
    await addProvider('walletconnect', 'WalletConnect', false, false)

    // testnet
    /*
    await addProvider('injected-ephemery-testnet-provider', 'Ephemery Testnet', true, false)
    await addProvider('injected-skale-chaos-testnet-provider', 'SKALE Chaos Testnet', true, false)
    */

    // external provider
    await addProvider('basic-http-provider', 'Custom - External Http Provider', false, false)
    await addProvider('hardhat-provider', 'Dev - Hardhat Provider', false, false)
    await addProvider('ganache-provider', 'Dev - Ganache Provider', false, false)
    await addProvider('foundry-provider', 'Dev - Foundry Provider', false, false)

    // register injected providers
    
    window.addEventListener(
      "eip6963:announceProvider",
      (event) => {
        registerInjectedProvider(event)
      }
    )
    
    window.dispatchEvent(new Event("eip6963:requestProvider"))
  }

  writeFile(fileName, content) {
    return this.call('fileManager', 'writeFile', fileName, content)
  }

  readFile(fileName) {
    return this.call('fileManager', 'readFile', fileName)
  }

  async resolveContractAndAddInstance(contractObject, address) {
    const data = await this.compilersArtefacts.getCompilerAbstract(contractObject.contract.file)

    this.compilersArtefacts.addResolvedContract(addressToString(address), data)
    this.addInstance(address, contractObject.abi, contractObject.name)
  }
}
