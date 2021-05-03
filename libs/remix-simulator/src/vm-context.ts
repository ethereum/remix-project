/* global ethereum */
'use strict'
import Web3 from 'web3'
import { rlp, keccak, bufferToHex } from 'ethereumjs-util'
import { vm as remixLibVm, execution } from '@remix-project/remix-lib'
import VM from '@ethereumjs/vm'
import Common from '@ethereumjs/common'
import StateManager from '@ethereumjs/vm/dist/state/stateManager'
import { StorageDump } from '@ethereumjs/vm/dist/state/interface'

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

  async dumpStorage (address) {
    let trie
    try {
      trie = await this._getStorageTrie(address)
    } catch (e) {
      console.log(e)
      throw e
    }
    return new Promise<StorageDump>((resolve, reject) => {
      try {
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
      } catch (e) {
        reject(e)
      }
    })
  }

  async getStateRoot (force = false) {
    await this._cache.flush()

    const stateRoot = this._trie.root
    return stateRoot
  }

  async setStateRoot (stateRoot) {
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
export class VMContext {
  currentFork: string
  blockGasLimitDefault: number
  blockGasLimit: number
  customNetWorks
  blocks
  latestBlockNumber
  txs
  vms
  web3vm
  logsManager
  exeResults

  constructor () {
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
    this.blocks = {}
    this.latestBlockNumber = 0
    this.txs = {}
    this.exeResults = {}
    this.logsManager = new execution.LogsManager()
  }

  createVm (hardfork) {
    const stateManager = new StateManagerCommonStorageDump()
    const common = new Common({ chain: 'mainnet', hardfork })
    const vm = new VM({
      common,
      activatePrecompiles: true,
      stateManager: stateManager
    })

    const web3vm = new remixLibVm.Web3VMProvider()
    web3vm.setVM(vm)
    return { vm, web3vm, stateManager, common }
  }

  web3 () {
    return this.vms[this.currentFork].web3vm
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

  addBlock (block) {
    let blockNumber = '0x' + block.header.number.toString('hex')
    if (blockNumber === '0x') {
      blockNumber = '0x0'
    }

    this.blocks['0x' + block.hash().toString('hex')] = block
    this.blocks[blockNumber] = block
    this.latestBlockNumber = blockNumber

    this.logsManager.checkBlock(blockNumber, block, this.web3())
  }

  trackTx (tx, block) {
    this.txs[tx] = block
  }

  trackExecResult (tx, execReult) {
    this.exeResults[tx] = execReult
  }
}
