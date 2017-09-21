'use strict'
var ethJSABI = require('ethereumjs-abi')

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

  _eventABI (contractabi) {
    contractabi = JSON.parse(contractabi.interface)
    var eventABI = {}
    contractabi.forEach(function (funABI, i) {
      if (funABI.type !== 'event') {
        return
      }
      var hash = ethJSABI.eventID(funABI.name, funABI.inputs.map(function (item) { return item.type }))
      eventABI[hash.toString('hex')] = { event: funABI.name, inputs: funABI.inputs }
    })
    return eventABI
  }

  _eventsABI (compiledContracts) {
    var eventsABI = {}
    for (var contract in compiledContracts) {
      eventsABI[contract] = this._eventABI(compiledContracts[contract])
    }
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
      var abi = this._event(log.topics[0].replace('0x', ''), eventsABI)
      if (abi) {
        var event
        try {
          var decoded = new Array(abi.inputs.length)
          event = abi.event
          var indexed = 1
          var nonindexed = []
          // decode indexed param
          abi.inputs.map(function (item, index) {
            if (item.indexed) {
              var encodedData = log.topics[indexed].replace('0x', '')
              try {
                decoded[index] = ethJSABI.rawDecode([item.type], new Buffer(encodedData, 'hex'))[0]
                decoded[index] = ethJSABI.stringify([item.type], decoded[index])
              } catch (e) {
                decoded[index] = encodedData
              }
              indexed++
            } else {
              nonindexed.push(item.type)
            }
          })
          // decode non indexed param
          var nonindexededResult = ethJSABI.rawDecode(nonindexed, new Buffer(log.data.replace('0x', ''), 'hex'))
          nonindexed = ethJSABI.stringify(nonindexed, nonindexededResult)
          // ordering
          var j = 0
          abi.inputs.map(function (item, index) {
            if (!item.indexed) {
              decoded[index] = nonindexed[j]
              j++
            }
          })
        } catch (e) {
          decoded = log.data
        }
        events.push({ event: event, args: decoded })
      } else {
        events.push({ data: log.data, topics: log.topics })
      }
    }
    cb(null, { decoded: events, raw: logs })
  }
}

module.exports = EventsDecoder
