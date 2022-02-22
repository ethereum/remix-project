'use strict'
import { ethers } from 'ethers'
import { visitContracts } from './txHelper'

/**
  * Register to txListener and extract events
  *
  */
export class EventsDecoder {
  resolveReceipt

  constructor ({ resolveReceipt }) {
    this.resolveReceipt = resolveReceipt
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
    this.resolveReceipt(tx, (error, receipt) => {
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

  _eventABI (contract): Record<string, { event, inputs, object, abi }> {
    const eventABI: Record<string, { event, inputs, object, abi }> = {}
    const abi = new ethers.utils.Interface(contract.abi)
    for (const e in abi.events) {
      const event = abi.getEvent(e)
      eventABI[abi.getEventTopic(e).replace('0x', '')] = { event: event.name, inputs: event.inputs, object: event, abi: abi }
    }
    return eventABI
  }

  _eventsABI (compiledContracts): Record<string, unknown> {
    const eventsABI: Record<string, unknown> = {}
    visitContracts(compiledContracts, (contract) => {
      eventsABI[contract.name] = this._eventABI(contract.object)
    })
    return eventsABI
  }

  _event (hash: string, eventsABI: Record<string, unknown>, contractName: string) {
    const events = eventsABI[contractName]
    if (!events) return null

    if (events[hash]) {
      const event = events[hash]
      for (const input of event.inputs) {
        if (input.type === 'function') {
          input.type = 'bytes24'
          input.baseType = 'bytes24'
        }
      }
      return event
    }
    return null
  }

  _stringifyBigNumber (value): string {
    return value._isBigNumber ? value.toString() : value
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
    for (const i in logs) {
      // [address, topics, mem]
      const log = logs[i]
      const topicId = log.topics[0]
      const eventAbi = this._event(topicId.replace('0x', ''), eventsABI, contractName)
      if (eventAbi) {
        const decodedlog = eventAbi.abi.parseLog(log)
        const decoded = {}
        for (const v in decodedlog.args) {
          decoded[v] = this._stringifyEvent(decodedlog.args[v])
        }
        events.push({ from: log.address, topic: topicId, event: eventAbi.event, args: decoded })
      } else {
        events.push({ from: log.address, data: log.data, topics: log.topics })
      }
    }
    cb(null, { decoded: events, raw: logs })
  }
}
