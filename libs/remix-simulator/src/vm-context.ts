/* global ethereum */
'use strict'
import Web3 from 'web3'
import { rlp, keccak, bufferToHex } from 'ethereumjs-util'
import { execution } from '@remix-project/remix-lib'
const { LogsManager } = execution
import { VmProxy } from './VmProxy'
import VM from '@ethereumjs/vm'
import Common from '@ethereumjs/common'
import StateManager from '@ethereumjs/vm/dist/state/stateManager'
import { StorageDump } from '@ethereumjs/vm/dist/state/interface'
import { Block } from '@ethereumjs/block'
import { Transaction } from '@ethereumjs/tx'

/*
  extend vm state manager and instanciate VM
*/

class StateManagerCommonStorageDump extends StateManager {
  keyHashes: { [key: string]: string }
  constructor () {
    super()
    this.keyHashes = {}
  }

  putContractStorage (address, key, value) {
    this.keyHashes[keccak(key).toString('hex')] = bufferToHex(key)
    return super.putContractStorage(address, key, value)
  }

  async dumpStorage (address): Promise<StorageDump> {
    return new Promise((resolve, reject) => {
      this._getStorageTrie(address)
        .then((trie) => {
          const storage = {}
          const stream = trie.createReadStream()

          stream.on('data', (val) => {
            const value = rlp.decode(val.value)
            storage['0x' + val.key.toString('hex')] = {
              key: this.keyHashes[val.key.toString('hex')],
              value: '0x' + value.toString('hex')
            }
          })
          stream.on('end', () => {
            resolve(storage)
          })
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  async getStateRoot (force = false) {
    await this._cache.flush()

    const stateRoot = this._trie.root
    return stateRoot
  }

  async setStateRoot (stateRoot) {
    if (this._checkpointCount !== 0) {
      throw new Error('Cannot set state root with uncommitted checkpoints')
    }

    await this._cache.flush()

    if (!stateRoot.equals(this._trie.EMPTY_TRIE_ROOT)) {
      const hasRoot = await this._trie.checkRoot(stateRoot)
      if (!hasRoot) {
        throw new Error('State trie does not contain state root')
      }
    }

    this._trie.root = stateRoot
    this._cache.clear()
    this._storageTries = {}
  }
}

export type CurrentVm = {
  vm: VM,
  web3vm: VmProxy,
  stateManager: StateManagerCommonStorageDump,
  common: Common
}

/*
  trigger contextChanged, web3EndpointChanged
*/
export class VMContext {
  currentFork: string
  blockGasLimitDefault: number
  blockGasLimit: number
  blocks: Record<string, Block>
  latestBlockNumber: string
  blockByTxHash: Record<string, Block>
  txByHash: Record<string, Transaction>
  currentVm: CurrentVm
  web3vm: VmProxy
  logsManager: any // LogsManager 
  exeResults: Record<string, Transaction>

  constructor (fork?) {
    this.blockGasLimitDefault = 4300000
    this.blockGasLimit = this.blockGasLimitDefault
    this.currentFork = fork || 'london'
    this.currentVm = this.createVm(this.currentFork)
    this.blocks = {}
    this.latestBlockNumber = "0x0"
    this.blockByTxHash = {}
    this.txByHash = {}
    this.exeResults = {}
    this.logsManager = new LogsManager()
  }

  createVm (hardfork) {
    const stateManager = new StateManagerCommonStorageDump()
    const common = new Common({ chain: 'mainnet', hardfork })
    const vm = new VM({
      common,
      activatePrecompiles: true,
      stateManager,
      allowUnlimitedContractSize: true
    })

    // VmProxy and VMContext are very intricated.
    // VmProxy is used to track the EVM execution (to listen on opcode execution, in order for instance to generate the VM trace)
    const web3vm = new VmProxy(this)
    web3vm.setVM(vm)
    return { vm, web3vm, stateManager, common }
  }

  getCurrentFork () {
    return this.currentFork
  }

  web3 () {
    return this.currentVm.web3vm
  }

  blankWeb3 () {
    return new Web3()
  }

  vm () {
    return this.currentVm.vm
  }

  vmObject () {
    return this.currentVm
  }

  addBlock (block: Block) {
    let blockNumber = '0x' + block.header.number.toString('hex')
    if (blockNumber === '0x') {
      blockNumber = '0x0'
    }

    this.blocks['0x' + block.hash().toString('hex')] = block
    this.blocks[blockNumber] = block
    this.latestBlockNumber = blockNumber

    this.logsManager.checkBlock(blockNumber, block, this.web3())
  }

  trackTx (txHash, block, tx) {
    this.blockByTxHash[txHash] = block
    this.txByHash[txHash] = tx
  }

  trackExecResult (tx, execReult) {
    this.exeResults[tx] = execReult
  }
}
