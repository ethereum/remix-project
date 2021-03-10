/* global ethereum */
'use strict'
import Web3 from 'web3'
import { rlp, keccak, bufferToHex } from 'ethereumjs-util'
import { vm, execution } from '@remix-project/remix-lib'
const EthJSVM = require('ethereumjs-vm').default
const StateManager = require('ethereumjs-vm/dist/state/stateManager').default

/*
  extend vm state manager and instanciate VM
*/

class StateManagerCommonStorageDump extends StateManager {
  constructor (arg) {
    super(arg)
    this.keyHashes = {}
  }

  putContractStorage (address, key, value, cb) {
    this.keyHashes[keccak(key).toString('hex')] = bufferToHex(key)
    super.putContractStorage(address, key, value, cb)
  }

  dumpStorage (address, cb) {
    this._getStorageTrie(address, (err, trie) => {
      if (err) {
        return cb(err)
      }
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
        cb(storage)
      })
    })
  }

  getStateRoot (cb) {
    const checkpoint = this._checkpointCount
    this._checkpointCount = 0
    super.getStateRoot((err, stateRoot) => {
      this._checkpointCount = checkpoint
      cb(err, stateRoot)
    })
  }

  setStateRoot (stateRoot, cb) {
    const checkpoint = this._checkpointCount
    this._checkpointCount = 0
    super.setStateRoot(stateRoot, (err) => {
      this._checkpointCount = checkpoint
      cb(err)
    })
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
    this.currentFork = 'muirGlacier'
    this.vms = {
      /*
      byzantium: createVm('byzantium'),
      constantinople: createVm('constantinople'),
      petersburg: createVm('petersburg'),
      istanbul: createVm('istanbul'),
      */
      muirGlacier: this.createVm('muirGlacier')
    }
    this.blocks = {}
    this.latestBlockNumber = 0
    this.txs = {}
    this.exeResults = {}
    this.logsManager = new execution.LogsManager()
  }

  createVm (hardfork) {
    const stateManager = new StateManagerCommonStorageDump({})
    stateManager.checkpoint(() => {})
    const ethvm = new EthJSVM({
      activatePrecompiles: true,
      blockchain: stateManager.blockchain,
      stateManager: stateManager,
      hardfork: hardfork
    })
    ethvm.blockchain.validate = false
    this.web3vm = new vm.Web3VMProvider()
    this.web3vm.setVM(ethvm)
    return { vm: ethvm, web3vm: this.web3vm, stateManager }
  }

  web3 () {
    return this.web3vm
  }

  blankWeb3 () {
    return new Web3()
  }

  vm () {
    return this.vms[this.currentFork].vm
  }

  addBlock (block) {
    let blockNumber = '0x' + block.header.number.toString('hex')
    if (blockNumber === '0x') {
      blockNumber = '0x0'
    }

    this.blocks['0x' + block.hash().toString('hex')] = block
    this.blocks[blockNumber] = block
    this.latestBlockNumber = blockNumber

    this.logsManager.checkBlock(blockNumber, block, this.web3vm)
  }

  trackTx (tx, block) {
    this.txs[tx] = block
  }

  trackExecResult (tx, execReult) {
    this.exeResults[tx] = execReult
  }
}
