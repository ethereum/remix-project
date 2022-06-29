var async = require('async')
var ethutil = require('ethereumjs-util')
var remixLib = require('@remix-project/remix-lib')
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../.././../../package.json'
var EventManager = remixLib.EventManager
var format = remixLib.execution.txFormat
var txHelper = remixLib.execution.txHelper
const helper = require('../../../../lib/helper')

const _paq = window._paq = window._paq || []  //eslint-disable-line

const profile = {
  name: 'recorder',
  displayName: 'Recorder',
  description: '',
  version: packageJson.version,
  methods: [  ]
}
/**
  * Record transaction as long as the user create them.
  */
class Recorder extends Plugin {
  constructor (blockchain) {
    super(profile)
    this.event = new EventManager()
    this.blockchain = blockchain
    this.data = { _listen: true, _replay: false, journal: [], _createdContracts: {}, _createdContractsReverse: {}, _usedAccounts: {}, _abis: {}, _contractABIReferences: {}, _linkReferences: {} }

    this.blockchain.event.register('initiatingTransaction', (timestamp, tx, payLoad) => {
      if (tx.useCall) return
      var { from, to, value } = tx

      // convert to and from to tokens
      if (this.data._listen) {
        var record = { value, parameters: payLoad.funArgs }
        if (!to) {
          var abi = payLoad.contractABI
          var keccak = ethutil.bufferToHex(ethutil.keccakFromString(JSON.stringify(abi)))
          record.abi = keccak
          record.contractName = payLoad.contractName
          record.bytecode = payLoad.contractBytecode
          record.linkReferences = payLoad.linkReferences
          if (record.linkReferences && Object.keys(record.linkReferences).length) {
            for (var file in record.linkReferences) {
              for (var lib in record.linkReferences[file]) {
                this.data._linkReferences[lib] = '<address>'
              }
            }
          }
          this.data._abis[keccak] = abi

          this.data._contractABIReferences[timestamp] = keccak
        } else {
          var creationTimestamp = this.data._createdContracts[to]
          record.to = `created{${creationTimestamp}}`
          record.abi = this.data._contractABIReferences[creationTimestamp]
        }
        record.name = payLoad.funAbi.name
        record.inputs = txHelper.serializeInputs(payLoad.funAbi)
        record.type = payLoad.funAbi.type
        for (var p in record.parameters) {
          var thisarg = record.parameters[p]
          var thistimestamp = this.data._createdContracts[thisarg]
          if (thistimestamp) record.parameters[p] = `created{${thistimestamp}}`
        }

        this.blockchain.getAccounts((error, accounts) => {
          if (error) return console.log(error)
          record.from = `account{${accounts.indexOf(from)}}`
          this.data._usedAccounts[record.from] = from
          this.append(timestamp, record)
        })
      }
    })

    this.blockchain.event.register('transactionExecuted', (error, from, to, data, call, txResult, timestamp, _payload) => {
      if (error) return console.log(error)
      if (call) return
      const rawAddress = txResult.receipt.contractAddress
      if (!rawAddress) return // not a contract creation
      const address = helper.addressToString(rawAddress)
      // save back created addresses for the convertion from tokens to real adresses
      this.data._createdContracts[address] = timestamp
      this.data._createdContractsReverse[timestamp] = address
    })
    this.blockchain.event.register('contextChanged', this.clearAll.bind(this))
    this.event.register('newTxRecorded', (count) => {
      this.event.trigger('recorderCountChange', [count])
    })
    this.event.register('cleared', () => {
      this.event.trigger('recorderCountChange', [0])
    })
  }

  /**
    * stop/start saving txs. If not listenning, is basically in replay mode
    *
    * @param {Bool} listen
    */
  setListen (listen) {
    this.data._listen = listen
    this.data._replay = !listen
  }

  extractTimestamp (value) {
    var stamp = /created{(.*)}/g.exec(value)
    if (stamp) {
      return stamp[1]
    }
    return null
  }

  /**
    * convert back from/to from tokens to real addresses
    *
    * @param {Object} record
    * @param {Object} accounts
    * @param {Object} options
    *
    */
  resolveAddress (record, accounts, options) {
    if (record.to) {
      var stamp = this.extractTimestamp(record.to)
      if (stamp) {
        record.to = this.data._createdContractsReverse[stamp]
      }
    }
    record.from = accounts[record.from]
    // @TODO: writing browser test
    return record
  }

  /**
    * save the given @arg record
    *
    * @param {Number/String} timestamp
    * @param {Object} record
    *
    */
  append (timestamp, record) {
    this.data.journal.push({ timestamp, record })
    this.event.trigger('newTxRecorded', [this.data.journal.length])
  }

  /**
    * basically return the records + associate values (like abis / accounts)
    *
    */
  getAll () {
    var records = [].concat(this.data.journal)
    return {
      accounts: this.data._usedAccounts,
      linkReferences: this.data._linkReferences,
      transactions: records.sort((A, B) => {
        var stampA = A.timestamp
        var stampB = B.timestamp
        return stampA - stampB
      }),
      abis: this.data._abis
    }
  }

  /**
    * delete the seen transactions
    *
    */
  clearAll () {
    this.data._listen = true
    this.data._replay = false
    this.data.journal = []
    this.data._createdContracts = {}
    this.data._createdContractsReverse = {}
    this.data._usedAccounts = {}
    this.data._abis = {}
    this.data._contractABIReferences = {}
    this.data._linkReferences = {}
    this.event.trigger('cleared', [])
  }

  /**
    * run the list of records
    *
    * @param {Object} records
    * @param {Object} accounts
    * @param {Object} options
    * @param {Object} abis
    * @param {Object} linkReferences
    * @param {Function} confirmationCb
    * @param {Function} continueCb
    * @param {Function} promptCb
    * @param {Function} alertCb
    * @param {Function} logCallBack
    * @param {Function} liveMode
    * @param {Function} newContractFn
    *
    */
  run (records, accounts, options, abis, linkReferences, confirmationCb, continueCb, promptCb, alertCb, logCallBack, liveMode, newContractFn) {
    this.setListen(false)
    const liveMsg = liveMode ? ' in live mode' : ''
    logCallBack(`Running ${records.length} transaction(s)${liveMsg} ...`)
    async.eachOfSeries(records, async (tx, index, cb) => {
      if (liveMode && tx.record.type === 'constructor') {
        // resolve the bytecode using the contract name, this ensure getting the last compiled one.
        const data = await this.call('compilerArtefacts', 'getArtefactsByContractName', tx.record.contractName)
        tx.record.bytecode = data.artefact.evm.bytecode.object
      }
      var record = this.resolveAddress(tx.record, accounts, options)
      var abi = abis[tx.record.abi]
      if (!abi) {
        return alertCb('cannot find ABI for ' + tx.record.abi + '.  Execution stopped at ' + index)
      }
      /* Resolve Library */
      if (record.linkReferences && Object.keys(record.linkReferences).length) {
        for (var k in linkReferences) {
          var link = linkReferences[k]
          var timestamp = this.extractTimestamp(link)
          if (timestamp && this.data._createdContractsReverse[timestamp]) {
            link = this.data._createdContractsReverse[timestamp]
          }
          tx.record.bytecode = format.linkLibraryStandardFromlinkReferences(k, link.replace('0x', ''), tx.record.bytecode, tx.record.linkReferences)
        }
      }
      /* Encode params */
      var fnABI
      if (tx.record.type === 'constructor') {
        fnABI = txHelper.getConstructorInterface(abi)
      } else if (tx.record.type === 'fallback') {
        fnABI = txHelper.getFallbackInterface(abi)
      } else if (tx.record.type === 'receive') {
        fnABI = txHelper.getReceiveInterface(abi)
      } else {
        fnABI = txHelper.getFunction(abi, record.name + record.inputs)
      }
      if (!fnABI) {
        alertCb('cannot resolve abi of ' + JSON.stringify(record, null, '\t') + '. Execution stopped at ' + index)
        return cb('cannot resolve abi')
      }
      if (tx.record.parameters) {
        /* check if we have some params to resolve */
        try {
          tx.record.parameters.forEach((value, index) => {
            var isString = true
            if (typeof value !== 'string') {
              isString = false
              value = JSON.stringify(value)
            }
            for (var timestamp in this.data._createdContractsReverse) {
              value = value.replace(new RegExp('created\\{' + timestamp + '\\}', 'g'), this.data._createdContractsReverse[timestamp])
            }
            if (!isString) value = JSON.parse(value)
            tx.record.parameters[index] = value
          })
        } catch (e) {
          return alertCb('cannot resolve input parameters ' + JSON.stringify(tx.record.parameters) + '. Execution stopped at ' + index)
        }
      }
      var data = format.encodeData(fnABI, tx.record.parameters, tx.record.bytecode)
      if (data.error) {
        alertCb(data.error + '. Record:' + JSON.stringify(record, null, '\t') + '. Execution stopped at ' + index)
        return cb(data.error)
      }
      logCallBack(`(${index}) ${JSON.stringify(record, null, '\t')}`)
      logCallBack(`(${index}) data: ${data.data}`)
      record.data = { dataHex: data.data, funArgs: tx.record.parameters, funAbi: fnABI, contractBytecode: tx.record.bytecode, contractName: tx.record.contractName, timestamp: tx.timestamp }

      this.blockchain.runTx(record, confirmationCb, continueCb, promptCb,
        (err, txResult, rawAddress) => {
          if (err) {
            console.error(err)
            return logCallBack(err + '. Execution failed at ' + index)
          }
          if (rawAddress) {
            const address = helper.addressToString(rawAddress)
            // save back created addresses for the convertion from tokens to real adresses
            this.data._createdContracts[address] = tx.timestamp
            this.data._createdContractsReverse[tx.timestamp] = address
            newContractFn(abi, address, record.contractName)
          }
          cb(err)
        }
      )
    }, () => { this.setListen(true) })
  }

  runScenario (liveMode, json, continueCb, promptCb, alertCb, confirmationCb, logCallBack, cb) {
    _paq.push(['trackEvent', 'run', 'recorder', 'start'])
    if (!json) {
      _paq.push(['trackEvent', 'run', 'recorder', 'wrong-json'])
      return cb('a json content must be provided')
    }
    if (typeof json === 'string') {
      try {
        json = JSON.parse(json)
      } catch (e) {
        return cb('A scenario file is required. It must be json formatted')
      }
    }

    let txArray
    let accounts
    let options
    let abis
    let linkReferences
    try {
      txArray = json.transactions || []
      accounts = json.accounts || []
      options = json.options || {}
      abis = json.abis || {}
      linkReferences = json.linkReferences || {}
    } catch (e) {
      return cb('Invalid Scenario File. Please try again')
    }

    if (!txArray.length) {
      return
    }

    this.run(txArray, accounts, options, abis, linkReferences, confirmationCb, continueCb, promptCb, alertCb, logCallBack, liveMode, (abi, address, contractName) => {
      cb(null, abi, address, contractName)
    })
  }
}

module.exports = Recorder
