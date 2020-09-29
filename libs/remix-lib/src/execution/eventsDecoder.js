'use strict'
const ethers = require('ethers')
const txHelper = require('./txHelper')

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
    const eventABI = {}
    const abi = new ethers.utils.Interface(contract.abi)
    for (let e in abi.events) {
      const event = abi.events[e]
      eventABI[event.topic.replace('0x', '')] = { event: event.name, inputs: event.inputs, object: event, abi: abi }
    }
    return eventABI
  }

  _eventsABI (compiledContracts) {
    const eventsABI = {}
    txHelper.visitContracts(compiledContracts, (contract) => {
      eventsABI[contract.name] = this._eventABI(contract.object)
    })
    return eventsABI
  }

  _event (hash, eventsABI) {
    for (let k in eventsABI) {
      if (eventsABI[k][hash]) {
        return eventsABI[k][hash]
      }
    }
    return null
  }

  _stringifyBigNumber (value) {
    return value._ethersType === 'BigNumber' ? value.toString() : value
  }

  _stringifyEvent (value) {
    if (value === null || value === undefined) return ' - '
    if (value._ethersType) value.type = value._ethersType
    if (Array.isArray(value)) {
      // for struct && array
      return value.map((item) => { return this._stringifyEvent(item) })
    } else {
      return this._stringifyBigNumber(value)
    }
  }

  _decodeEvents (tx, logs, contractName, compiledContracts, cb) {
    const eventsABI = this._eventsABI(compiledContracts)
    const events = []
    for (let i in logs) {
      // [address, topics, mem]
      const log = logs[i]
      const topicId = log.topics[0]
      const eventAbi = this._event(topicId.replace('0x', ''), eventsABI)
      if (eventAbi) {
        const decodedlog = eventAbi.abi.parseLog(log)
        const decoded = {}
        for (const v in decodedlog.values) {
          decoded[v] = this._stringifyEvent(decodedlog.values[v])
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
