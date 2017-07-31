'use strict'
var $ = require('jquery')
var ethJSABI = require('ethereumjs-abi')

/**
  * Register to txListener and extract events
  *
  */
class EventsDecoder {
  constructor (opt = {}) {
    this.txListener = opt.txListener
    this.resolvedEvents = {}
  }

/**
  * use Transaction Receipt to decode logs. assume that the transaction as already been resolved by txListener.
  * logs are decoded only if the contract if known by remix.
  *
  * @param {Object} tx - transaction object
  * @param {Function} cb - callback
  */
  parseLogs (tx, resolvedData, compiledContracts) {
    this.txListener.resolveTransactionReceipt(tx, (error, receipt) => {
      if (error) console.log(error)
      this._decodeLogs(tx, receipt, resolvedData.contractName, compiledContracts)
    })
  }

  eventsOf (hash) {
    return this.resolvedEvents[hash]
  }

  _decodeLogs (tx, receipt, contract, contracts) {
    if (!contract || !receipt.logs) {
      return
    }
    this._decodeEvents(tx, receipt.logs, contract, contracts)
  }

  _eventABI (contractName, compiledContracts) {
    var contractabi = JSON.parse(compiledContracts[contractName].interface)
    var eventABI = {}
    $.each(contractabi, function (i, funABI) {
      if (funABI.type !== 'event') {
        return
      }
      var hash = ethJSABI.eventID(funABI.name, funABI.inputs.map(function (item) { return item.type }))
      eventABI[hash.toString('hex')] = { event: funABI.name, inputs: funABI.inputs }
    })
    return eventABI
  }

  _decodeEvents (tx, logs, contractName, compiledContracts) {
    var eventABI = this._eventABI(contractName, compiledContracts)
    // FIXME: support indexed events
    for (var i in logs) {
      // [address, topics, mem]
      var log = logs[i]
      var event
      var decoded

      try {
        var abi = eventABI[log.topics[0].replace('0x', '')]
        event = abi.event
        var types = abi.inputs.map(function (item) {
          return item.type
        })
        decoded = ethJSABI.rawDecode(types, new Buffer(log.data.replace('0x', ''), 'hex'))
        decoded = ethJSABI.stringify(types, decoded)
      } catch (e) {
        decoded = log.data
      }
      if (!this.resolvedEvents[tx.hash]) {
        this.resolvedEvents[tx.hash] = []
      }
      this.resolvedEvents[tx.hash].push({ event: event, args: decoded })
    }
  }
}

module.exports = EventsDecoder
