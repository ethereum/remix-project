/* global ethereum */
'use strict'
import Web3 from 'web3'
import { EventManager } from '../eventManager'
import { rlp, keccak, bufferToHex } from 'ethereumjs-util'
import { Web3VmProvider } from '../web3Provider/web3VmProvider'
import { LogsManager } from './logsManager'
import VM from '@ethereumjs/vm'
import Common from '@ethereumjs/common'
import StateManager from '@ethereumjs/vm/dist/state/stateManager'
import { StorageDump } from '@ethereumjs/vm/dist/state/interface'

declare let ethereum: any
let web3

if (typeof window !== 'undefined' && typeof window['ethereum'] !== 'undefined') {
  var injectedProvider = window['ethereum']
  web3 = new Web3(injectedProvider)
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}

/*
  extend vm state manager and instanciate VM
*/

class StateManagerCommonStorageDump extends StateManager {
  keyHashes
  constructor () {
    super()
    this.keyHashes = {}
  }

S
putContractStorage (address, key, value) {
  this.keyHashes[keccak(key).toString('hex')] = bufferToHex(key)
  return super.putContractStorage(address, key, value)
}

dumpStorage (address) {
  return new Promise<StorageDump>((resolve, reject) => {
    this._getStorageTrie(address).then((trie) => {
      const storage = {}
      const stream = trie.createReadStream()
      stream.on('data', (val) => {
        const value = rlp.decode(val.value)
        storage['0x' + val.key.toString('hex')] = {
          key: this.keyHashes[val.key.toString('hex')],
          value: '0x' + value.toString('hex')
        }
      })
      stream.on('end', function () {
        resolve(storage)
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

async getStateRoot (force: boolean = false): Promise<Buffer> {
  if (!force && this._checkpointCount !== 0) {
    // throw new Error('Cannot get state root with uncommitted checkpoints')
  }

  try {
    await this._cache.flush()
  } catch (e) {
    console.error(e)
  }

  const stateRoot = this._trie.root
  return stateRoot
}

async setStateRoot (stateRoot: Buffer): Promise<void> {
  if (this._checkpointCount !== 0) {
    // throw new Error('Cannot set state root with uncommitted checkpoints')
  }

  await this._cache.flush()

  if (stateRoot === this._trie.EMPTY_TRIE_ROOT) {
    this._trie.root = stateRoot
    this._cache.clear()
    this._storageTries = {}
    return
  }

  const hasRoot = await this._trie.checkRoot(stateRoot)
  if (!hasRoot) {
    throw new Error('State trie does not contain state root')
  }

  this._trie.root = stateRoot
  this._cache.clear()
  this._storageTries = {}
}
}

/*
  trigger contextChanged, web3EndpointChanged
*/
export class ExecutionContext {
  event
  logsManager
  blockGasLimitDefault
  blockGasLimit
  customNetWorks
  blocks
  latestBlockNumber
  txs
  executionContext
  listenOnLastBlockId
  currentFork: string
  vms
  mainNetGenesisHash: string

  constructor () {
    this.event = new EventManager()
    this.logsManager = new LogsManager()
    this.executionContext = null
    this.blockGasLimitDefault = 4300000
    this.blockGasLimit = this.blockGasLimitDefault
    this.currentFork = 'berlin'
    this.vms = {
      /*
      byzantium: createVm('byzantium'),
      constantinople: createVm('constantinople'),
      petersburg: createVm('petersburg'),
      istanbul: createVm('istanbul'),
      */
      berlin: this.createVm('berlin')
    }
    this.mainNetGenesisHash = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
    this.customNetWorks = {}
    this.blocks = {}
    this.latestBlockNumber = 0
    this.txs = {}
  }

  init (config) {
    if (config.get('settings/always-use-vm')) {
      this.executionContext = 'vm'
    } else {
      this.executionContext = injectedProvider ? 'injected' : 'vm'
      if (this.executionContext === 'injected') this.askPermission()
    }
  }

  createVm (hardfork) {
    const stateManager = new StateManagerCommonStorageDump()
    stateManager.checkpoint()
    const common = new Common({ chain: 'mainnet', hardfork })
    const vm = new VM({
      common,
      activatePrecompiles: true,
      stateManager: stateManager
    })

    const web3vm = new Web3VmProvider()
    web3vm.setVM(vm)
    return { vm, web3vm, stateManager, common }
  }

  askPermission () {
    // metamask
    if (ethereum && typeof ethereum.enable === 'function') ethereum.enable()
  }

  getProvider () {
    return this.executionContext
  }

  isVM () {
    return this.executionContext === 'vm'
  }

  web3 () {
    return this.isVM() ? this.vms[this.currentFork].web3vm : web3
  }

  detectNetwork (callback) {
    if (this.isVM()) {
      callback(null, { id: '-', name: 'VM' })
    } else {
      web3.eth.net.getId((err, id) => {
        let name = null
        if (err) name = 'Unknown'
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
        else if (id === 1) name = 'Main'
        else if (id === 2) name = 'Morden (deprecated)'
        else if (id === 3) name = 'Ropsten'
        else if (id === 4) name = 'Rinkeby'
        else if (id === 5) name = 'Goerli'
        else if (id === 42) name = 'Kovan'
        else name = 'Custom'

        if (id === '1') {
          web3.eth.getBlock(0, (error, block) => {
            if (error) console.log('cant query first block')
            if (block && block.hash !== this.mainNetGenesisHash) name = 'Custom'
            callback(err, { id, name })
          })
        } else {
          callback(err, { id, name })
        }
      })
    }
  }

  removeProvider (name) {
    if (name && this.customNetWorks[name]) {
      if (this.executionContext === name) this.setContext('vm', null, null, null)
      delete this.customNetWorks[name]
      this.event.trigger('removeProvider', [name])
    }
  }

  addProvider (network) {
    if (network && network.name && !this.customNetWorks[network.name]) {
      this.customNetWorks[network.name] = network
      this.event.trigger('addProvider', [network])
    }
  }

  internalWeb3 () {
    return web3
  }

  blankWeb3 () {
    return new Web3()
  }

  vm () {
    return this.vms[this.currentFork].vm
  }

  vmObject () {
    return this.vms[this.currentFork]
  }

  setContext (context, endPointUrl, confirmCb, infoCb) {
    this.executionContext = context
    this.executionContextChange(context, endPointUrl, confirmCb, infoCb, null)
  }

  executionContextChange (context, endPointUrl, confirmCb, infoCb, cb) {
    if (!cb) cb = () => {}
    if (!confirmCb) confirmCb = () => {}
    if (!infoCb) infoCb = () => {}
    if (context === 'vm') {
      this.executionContext = context
      this.vms[this.currentFork].stateManager.revert().then(() => {
        this.vms[this.currentFork].stateManager.checkpoint()
      })
      this.event.trigger('contextChanged', ['vm'])
      return cb()
    }

    if (context === 'injected') {
      if (injectedProvider === undefined) {
        infoCb('No injected Web3 provider found. Make sure your provider (e.g. MetaMask) is active and running (when recently activated you may have to reload the page).')
        return cb()
      } else {
        this.askPermission()
        this.executionContext = context
        web3.setProvider(injectedProvider)
        this._updateBlockGasLimit()
        this.event.trigger('contextChanged', ['injected'])
        return cb()
      }
    }

    if (context === 'web3') {
      confirmCb(cb)
    }

    if (this.customNetWorks[context]) {
      var network = this.customNetWorks[context]
      this.setProviderFromEndpoint(network.provider, network.name, (error) => {
        if (error) infoCb(error)
        cb()
      })
    }
  }

  currentblockGasLimit () {
    return this.blockGasLimit
  }

  stopListenOnLastBlock () {
    if (this.listenOnLastBlockId) clearInterval(this.listenOnLastBlockId)
    this.listenOnLastBlockId = null
  }

  _updateBlockGasLimit () {
    if (this.getProvider() !== 'vm') {
      web3.eth.getBlock('latest', (err, block) => {
        if (!err) {
          // we can't use the blockGasLimit cause the next blocks could have a lower limit : https://github.com/ethereum/remix/issues/506
          this.blockGasLimit = (block && block.gasLimit) ? Math.floor(block.gasLimit - (5 * block.gasLimit) / 1024) : this.blockGasLimitDefault
        } else {
          this.blockGasLimit = this.blockGasLimitDefault
        }
      })
    }
  }

  listenOnLastBlock () {
    this.listenOnLastBlockId = setInterval(() => {
      this._updateBlockGasLimit()
    }, 15000)
  }

  // TODO: remove this when this function is moved

  setProviderFromEndpoint (endpoint, context, cb) {
    const oldProvider = web3.currentProvider

    web3.setProvider(endpoint)

    web3.eth.net.isListening((err, isConnected) => {
      if (!err && isConnected) {
        this.executionContext = context
        this._updateBlockGasLimit()
        this.event.trigger('contextChanged', [context])
        this.event.trigger('web3EndpointChanged')
        cb()
      } else {
        web3.setProvider(oldProvider)
        cb('Not possible to connect to the Web3 provider. Make sure the provider is running, a connection is open (via IPC or RPC) or that the provider plugin is properly configured.')
      }
    })
  }

  txDetailsLink (network, hash) {
    const transactionDetailsLinks = {
      Main: 'https://www.etherscan.io/tx/',
      Rinkeby: 'https://rinkeby.etherscan.io/tx/',
      Ropsten: 'https://ropsten.etherscan.io/tx/',
      Kovan: 'https://kovan.etherscan.io/tx/',
      Goerli: 'https://goerli.etherscan.io/tx/'
    }

    if (transactionDetailsLinks[network]) {
      return transactionDetailsLinks[network] + hash
    }
  }

  addBlock (block) {
    let blockNumber = '0x' + block.header.number.toString('hex')
    if (blockNumber === '0x') {
      blockNumber = '0x0'
    }
    blockNumber = web3.utils.toHex(web3.utils.toBN(blockNumber))

    this.blocks['0x' + block.hash().toString('hex')] = block
    this.blocks[blockNumber] = block
    this.latestBlockNumber = blockNumber

    this.logsManager.checkBlock(blockNumber, block, this.web3())
  }

  trackTx (tx, block) {
    this.txs[tx] = block
  }
}
