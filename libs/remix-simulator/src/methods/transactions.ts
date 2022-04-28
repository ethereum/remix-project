import Web3 from 'web3'
import { toChecksumAddress, BN, Address } from 'ethereumjs-util'
import { processTx } from './txProcess'
import { execution } from '@remix-project/remix-lib'
import { ethers } from 'ethers'
const TxRunnerVM = execution.TxRunnerVM
const TxRunner = execution.TxRunner

export class Transactions {
  vmContext
  accounts
  tags
  txRunnerVMInstance
  txRunnerInstance
  TX_INDEX = '0x0' // currently there's always only 1 tx per block, so the transaction index will always be 0x0

  constructor (vmContext) {
    this.vmContext = vmContext
    this.tags = {}
  }

  init (accounts) {
    this.accounts = accounts
    const api = {
      logMessage: (msg) => {
      },
      logHtmlMessage: (msg) => {
      },
      config: {
        getUnpersistedProperty: (key) => {
          return true
        },
        get: () => {
          return true
        }
      },
      detectNetwork: (cb) => {
        cb()
      },
      personalMode: () => {
        return false
      }
    }

    this.txRunnerVMInstance = new TxRunnerVM(accounts, api, _ => this.vmContext.vmObject())
    this.txRunnerInstance = new TxRunner(this.txRunnerVMInstance, { runAsync: false })
    this.txRunnerInstance.vmaccounts = accounts
  }

  methods () {
    return {
      eth_sendTransaction: this.eth_sendTransaction.bind(this),
      eth_getTransactionReceipt: this.eth_getTransactionReceipt.bind(this),
      eth_getCode: this.eth_getCode.bind(this),
      eth_call: this.eth_call.bind(this),
      eth_estimateGas: this.eth_estimateGas.bind(this),
      eth_getTransactionCount: this.eth_getTransactionCount.bind(this),
      eth_getTransactionByHash: this.eth_getTransactionByHash.bind(this),
      eth_getTransactionByBlockHashAndIndex: this.eth_getTransactionByBlockHashAndIndex.bind(this),
      eth_getTransactionByBlockNumberAndIndex: this.eth_getTransactionByBlockNumberAndIndex.bind(this),
      eth_getExecutionResultFromSimulator: this.eth_getExecutionResultFromSimulator.bind(this),
      eth_getHHLogsForTx: this.eth_getHHLogsForTx.bind(this),
      eth_getHashFromTagBySimulator: this.eth_getHashFromTagBySimulator.bind(this)
    }
  }

  eth_sendTransaction (payload, cb) {
    // from might be lowercased address (web3)
    if (payload.params && payload.params.length > 0 && payload.params[0].from) {
      payload.params[0].from = toChecksumAddress(payload.params[0].from)
    }
    processTx(this.txRunnerInstance, payload, false, (error, result) => {
      if (!error && result) {
        this.vmContext.addBlock(result.block)
        const hash = '0x' + result.tx.hash().toString('hex')
        this.vmContext.trackTx(hash, result.block, result.tx)
        this.vmContext.trackExecResult(hash, result.result.execResult)
        return cb(null, result.transactionHash)
      }
      cb(error)
    })
  }

  eth_getExecutionResultFromSimulator (payload, cb) {
    const txHash = payload.params[0]
    cb(null, this.vmContext.exeResults[txHash])
  }

  eth_getHHLogsForTx (payload, cb) {
    const txHash = payload.params[0]
    cb(null, this.vmContext.currentVm.web3vm.hhLogs[txHash] ? this.vmContext.currentVm.web3vm.hhLogs[txHash] : [])
  }

  eth_getTransactionReceipt (payload, cb) {
    this.vmContext.web3().eth.getTransactionReceipt(payload.params[0], (error, receipt) => {
      if (error) {
        return cb(error)
      }

      const txBlock = this.vmContext.blockByTxHash[receipt.hash]

      const logs = this.vmContext.logsManager.getLogsByTxHash(receipt.hash)

      const r: Record <string, unknown> = {
        transactionHash: receipt.hash,
        transactionIndex: this.TX_INDEX,
        blockHash: '0x' + txBlock.hash().toString('hex'),
        blockNumber: '0x' + txBlock.header.number.toString('hex'),
        gasUsed: receipt.gasUsed,
        cumulativeGasUsed: receipt.gasUsed, // only 1 tx per block
        contractAddress: receipt.contractAddress,
        logs,
        status: receipt.status,
        to: receipt.to
      }

      if (r.blockNumber === '0x') {
        r.blockNumber = '0x0'
      }

      cb(null, r)
    })
  }

  eth_estimateGas (payload, cb) {
    // from might be lowercased address (web3)
    if (payload.params && payload.params.length > 0 && payload.params[0].from) {
      payload.params[0].from = toChecksumAddress(payload.params[0].from)
    }
    if (payload.params && payload.params.length > 0 && payload.params[0].to) {
      payload.params[0].to = toChecksumAddress(payload.params[0].to)
    }

    payload.params[0].gas = 10000000 * 10

    processTx(this.txRunnerInstance, payload, true, (error, { result }) => {
      if (error) return cb(error)
      if (result.status === '0x0') {
        try {
          const msg = result.execResult.returnValue
          const abiCoder = new ethers.utils.AbiCoder()
          const reason = abiCoder.decode(['string'], msg.slice(4))[0]
          return cb('revert ' + reason)
        } catch (e) {
          return cb(e.message)
        }
      }
      let gasUsed = result.execResult.gasUsed.toNumber()
      if (result.execResult.gasRefund) {
        gasUsed += result.execResult.gasRefund.toNumber()
      }
      cb(null, Math.ceil(gasUsed + (15 * gasUsed) / 100))
    })
  }

  eth_getCode (payload, cb) {
    const address = payload.params[0]

    this.vmContext.web3().eth.getCode(address, (error, result) => {
      if (error) {
        console.dir('error getting code')
        console.dir(error)
      }
      cb(error, result)
    })
  }

  eth_call (payload, cb) {
    // from might be lowercased address (web3)
    if (payload.params && payload.params.length > 0 && payload.params[0].from) {
      payload.params[0].from = toChecksumAddress(payload.params[0].from)
    }
    if (payload.params && payload.params.length > 0 && payload.params[0].to) {
      payload.params[0].to = toChecksumAddress(payload.params[0].to)
    }

    payload.params[0].value = undefined

    const tag = payload.params[0].timestamp // e2e reference

    processTx(this.txRunnerInstance, payload, true, (error, result) => {
      if (!error && result) {
        this.vmContext.addBlock(result.block)
        const hash = '0x' + result.tx.hash().toString('hex')
        this.vmContext.trackTx(hash, result.block, result.tx)
        this.vmContext.trackExecResult(hash, result.result.execResult)
        this.tags[tag] = result.transactionHash
        // calls are not supposed to return a transaction hash. we do this for keeping track of it and allowing debugging calls.
        const returnValue = `0x${result.result.execResult.returnValue.toString('hex') || '0'}`
        return cb(null, returnValue)
      }
      cb(error)
    })
  }

  eth_getHashFromTagBySimulator (payload, cb) {
    return cb(null, this.tags[payload.params[0]])
  }

  eth_getTransactionCount (payload, cb) {
    const address = payload.params[0]

    this.vmContext.vm().stateManager.getAccount(Address.fromString(address)).then((account) => {
      const nonce = new BN(account.nonce).toString(10)
      cb(null, nonce)
    }).catch((error) => {
      cb(error)
    })
  }

  eth_getTransactionByHash (payload, cb) {
    const address = payload.params[0]

    this.vmContext.web3().eth.getTransactionReceipt(address, (error, receipt) => {
      if (error) {
        return cb(error)
      }

      const txBlock = this.vmContext.blockByTxHash[receipt.transactionHash]
      const tx = this.vmContext.txByHash[receipt.transactionHash]

      // TODO: params to add later
      const r: Record<string, unknown> = {
        blockHash: '0x' + txBlock.hash().toString('hex'),
        blockNumber: '0x' + txBlock.header.number.toString('hex'),
        from: receipt.from,
        gas: Web3.utils.toHex(receipt.gas),
        chainId: '0xd05',
        // 'gasPrice': '2000000000000', // 0x123
        gasPrice: '0x4a817c800', // 20000000000
        hash: receipt.transactionHash,
        input: receipt.input,
        nonce: '0x' + tx.nonce.toString('hex'),
        transactionIndex: this.TX_INDEX,
        value: receipt.value
        // "value":"0xf3dbb76162000" // 4290000000000000
        // "v": "0x25", // 37
        // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
        // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
      }

      if (receipt.to) {
        r['to'] = receipt.to
      }

      if (r.value === '0x') {
        r.value = '0x0'
      }

      if (r.blockNumber === '0x') {
        r.blockNumber = '0x0'
      }

      cb(null, r)
    })
  }

  eth_getTransactionByBlockHashAndIndex (payload, cb) {
    const txIndex = payload.params[1]

    const txBlock = this.vmContext.blocks[payload.params[0]]
    const txHash = '0x' + txBlock.transactions[Web3.utils.toDecimal(txIndex)].hash().toString('hex')

    this.vmContext.web3().eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        return cb(error)
      }

      const tx = this.vmContext.txByHash[receipt.transactionHash]

      // TODO: params to add later
      const r: Record<string, unknown> = {
        blockHash: '0x' + txBlock.hash().toString('hex'),
        blockNumber: '0x' + txBlock.header.number.toString('hex'),
        from: receipt.from,
        gas: Web3.utils.toHex(receipt.gas),
        chainId: '0xd05',
        // 'gasPrice': '2000000000000', // 0x123
        gasPrice: '0x4a817c800', // 20000000000
        hash: receipt.transactionHash,
        input: receipt.input,
        nonce: '0x' + tx.nonce.toString('hex'),
        transactionIndex: this.TX_INDEX,
        value: receipt.value
        // "value":"0xf3dbb76162000" // 4290000000000000
        // "v": "0x25", // 37
        // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
        // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
      }

      if (receipt.to) {
        r['to'] = receipt.to
      }

      if (r.value === '0x') {
        r.value = '0x0'
      }

      cb(null, r)
    })
  }

  eth_getTransactionByBlockNumberAndIndex (payload, cb) {
    const txIndex = payload.params[1]

    const txBlock = this.vmContext.blocks[payload.params[0]]
    const txHash = '0x' + txBlock.transactions[Web3.utils.toDecimal(txIndex)].hash().toString('hex')

    this.vmContext.web3().eth.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        return cb(error)
      }

      const tx = this.vmContext.txByHash[receipt.transactionHash]

      // TODO: params to add later
      const r: Record<string, unknown> = {
        blockHash: '0x' + txBlock.hash().toString('hex'),
        blockNumber: '0x' + txBlock.header.number.toString('hex'),
        from: receipt.from,
        gas: Web3.utils.toHex(receipt.gas),
        // 'gasPrice': '2000000000000', // 0x123
        chainId: '0xd05',
        gasPrice: '0x4a817c800', // 20000000000
        hash: receipt.transactionHash,
        input: receipt.input,
        nonce: '0x' + tx.nonce.toString('hex'),
        transactionIndex: this.TX_INDEX,
        value: receipt.value
        // "value":"0xf3dbb76162000" // 4290000000000000
        // "v": "0x25", // 37
        // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
        // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
      }

      if (receipt.to) {
        r['to'] = receipt.to
      }

      if (r.value === '0x') {
        r.value = '0x0'
      }

      cb(null, r)
    })
  }
}
