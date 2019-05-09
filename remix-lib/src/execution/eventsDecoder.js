'use strict'
var ethers = require('ethers')
var txHelper = require('./txHelper')

/**
  * Register to txListener and extract events
  *
  */
class EventsDecoder {
  constructor (opt = {}) {
    this._api = opt.api
  }

/**
  * use Transaction Receipt to decode logs. assume that the transaction as already been resolved by txListener.
  * logs are decoded only if the contract if known by remix.
  *
  * @param {Object} tx - transaction object
  * @param {Function} cb - callback
  */
  parseLogs (tx, contractName, compiledContracts, cb) {
    if (tx.isCall) return cb(null, { decoded: [], raw: [] })
    this._api.resolveReceipt(tx, (error, receipt) => {
      if (error) return cb(error)
      this._decodeLogs(tx, receipt, contractName, compiledContracts, cb)
    })
  }

  _decodeLogs (tx, receipt, contract, contracts, cb) {
    if (!contract || !receipt) {
      return cb('cannot decode logs - contract or receipt not resolved ')
    }
    if (!receipt.logs) {
      return cb(null, { decoded: [], raw: [] })
    }
    this._decodeEvents(tx, receipt.logs, contract, contracts, cb)
  }

  _eventABI (contract) {
    var eventABI = {}
    var abi = new ethers.utils.Interface(contract.abi)
    for (var e in abi.events) {
      var event = abi.events[e]
      eventABI[event.topic.replace('0x', '')] = { event: event.name, inputs: event.inputs, object: event, abi: abi }
    }
    return eventABI
  }

  _eventsABI (compiledContracts) {
    var eventsABI = {}
    txHelper.visitContracts(compiledContracts, (contract) => {
      eventsABI[contract.name] = this._eventABI(contract.object)
    })
    return eventsABI
  }

  _event (hash, eventsABI) {
    for (var k in eventsABI) {
      if (eventsABI[k][hash]) {
        return eventsABI[k][hash]
      }
    }
    return null
  }

  _decodeEvents (tx, logs, contractName, compiledContracts, cb) {
    var eventsABI = this._eventsABI(compiledContracts)
    var events = []
    for (var i in logs) {
      // [address, topics, mem]
      var log = logs[i]
      var topicId = log.topics[0]
      var eventAbi = this._event(topicId.replace('0x', ''), eventsABI)
      if (eventAbi) {
        var decodedlog = eventAbi.abi.parseLog(log)
        let decoded = {}
        for (const v in decodedlog.values) {
          const value = decodedlog.values[v]
          if (value._ethersType) value.type = value._ethersType
          let decodedValue = value._ethersType === 'BigNumber' ? value.toString() : value
          decoded[v] = decodedValue
        }
        events.push({ from: log.address, topic: topicId, event: eventAbi.event, args: decoded })
      } else {
        events.push({ from: log.address, data: log.data, topics: log.topics })
      }
    }
    cb(null, { decoded: events, raw: logs })
  }
}

module.exports = EventsDecoder
