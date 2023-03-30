/* global ethereum */
'use strict'
import { hash } from '@remix-project/remix-lib'
import { bufferToHex } from '@ethereumjs/util'
import type { Address } from '@ethereumjs/util'
import { decode } from 'rlp'
import { ethers } from 'ethers'
import { execution } from '@remix-project/remix-lib'
const { LogsManager } = execution
import { VmProxy } from './VmProxy'
import { VM } from '@ethereumjs/vm'
import { Common } from '@ethereumjs/common'
import { Trie } from '@ethereumjs/trie'
import { DefaultStateManager, StateManager, EthersStateManager, EthersStateManagerOpts } from '@ethereumjs/statemanager'
import { StorageDump } from '@ethereumjs/statemanager/dist/interface'
import { EVM } from '@ethereumjs/evm'
import { EEI } from '@ethereumjs/vm'
import { Blockchain } from '@ethereumjs/blockchain'
import { Block } from '@ethereumjs/block'
import { Transaction } from '@ethereumjs/tx'
import { bigIntToHex } from '@ethereumjs/util'

/**
 * Options for constructing a {@link StateManager}.
 */
export interface DefaultStateManagerOpts {
  /**
   * A {@link Trie} instance
   */
  trie?: Trie
  /**
   * Option to prefix codehashes in the database. This defaults to `true`.
   * If this is disabled, note that it is possible to corrupt the trie, by deploying code
   * which code is equal to the preimage of a trie-node.
   * E.g. by putting the code `0x80` into the empty trie, will lead to a corrupted trie.
   */
  prefixCodeHashes?: boolean
}

class CustomEthersStateManager extends EthersStateManager {
  keyHashes: { [key: string]: string }
  constructor (opts: EthersStateManagerOpts) {
    super(opts)
    this.keyHashes = {}
  }

  putContractStorage (address, key, value) {
    this.keyHashes[bufferToHex(key).replace('0x', '')] = hash.keccak(key).toString('hex')
    return super.putContractStorage(address, key, value)
  }

  copy(): CustomEthersStateManager {
    const newState = new CustomEthersStateManager({
      provider: (this as any).provider,
      blockTag: BigInt((this as any).blockTag),
    })
    ;(newState as any).contractCache = new Map((this as any).contractCache)
    ;(newState as any).storageCache = new Map((this as any).storageCache)
    ;(newState as any)._cache = this._cache
    ;(newState as any).keyHashes = this.keyHashes
    return newState
  }

  async dumpStorage(address: Address): Promise<StorageDump> {
    const storageDump = {}
    const storage = await super.dumpStorage(address)
    for (const key of Object.keys(storage)) {
      const value = storage[key]
      storageDump['0x' + this.keyHashes[key]] = {
        key: '0x' + key,
        value: value
      }
    }
    return storageDump
  }
}

/*
  extend vm state manager and instanciate VM
*/
class StateManagerCommonStorageDump extends DefaultStateManager {
  keyHashes: { [key: string]: string }
  constructor (opts: DefaultStateManagerOpts = {}) {
    super(opts)
    this.keyHashes = {}
  }

  putContractStorage (address, key, value) {
    this.keyHashes[hash.keccak(key).toString('hex')] = bufferToHex(key)
    return super.putContractStorage(address, key, value)
  }

  copy(): StateManagerCommonStorageDump {
    const copyState =  new StateManagerCommonStorageDump({
      trie: this._trie.copy(false),
    })
    copyState.keyHashes = this.keyHashes
    return copyState
  }

  async dumpStorage (address): Promise<StorageDump> {
    return new Promise((resolve, reject) => {
      this._getStorageTrie(address)
        .then((trie) => {
          const storage = {}
          const stream = trie.createReadStream()

          stream.on('data', (val) => {
            const value = decode(val.value)
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
}

export type CurrentVm = {
  vm: VM,
  web3vm: VmProxy,
  stateManager: StateManager,
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
  nodeUrl: string
  blockNumber: number | 'latest'

  constructor (fork?: string, nodeUrl?: string, blockNumber?: number | 'latest') {
    this.blockGasLimitDefault = 4300000
    this.blockGasLimit = this.blockGasLimitDefault
    this.currentFork = fork || 'london'
    this.nodeUrl = nodeUrl
    this.blockNumber = blockNumber
    this.blocks = {}
    this.latestBlockNumber = "0x0"
    this.blockByTxHash = {}
    this.txByHash = {}
    this.exeResults = {}
    this.logsManager = new LogsManager()
  }

  async init () {
    this.currentVm = await this.createVm(this.currentFork)
  }

  async createVm (hardfork) {
    let stateManager: StateManager
    if (this.nodeUrl) {
      let block = this.blockNumber
      if (this.blockNumber === 'latest') {
        const provider = new ethers.providers.StaticJsonRpcProvider(this.nodeUrl)
        block = await provider.getBlockNumber()
      }
      stateManager = new CustomEthersStateManager({
        provider: this.nodeUrl,
        blockTag: BigInt(block)
      })
    } else
      stateManager = new StateManagerCommonStorageDump()

    const common = new Common({ chain: 'mainnet', hardfork })
    const blockchain = new (Blockchain as any)({ common })
    const eei = new EEI(stateManager, common, blockchain)
    const evm = new EVM({ common, eei, allowUnlimitedContractSize: true })
    
    const vm = await VM.create({
      common,
      activatePrecompiles: true,
      stateManager,
      blockchain,
      evm
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

  vm () {
    return this.currentVm.vm
  }

  vmObject () {
    return this.currentVm
  }

  addBlock (block: Block) {
    let blockNumber = bigIntToHex(block.header.number)
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
