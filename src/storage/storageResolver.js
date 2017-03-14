'use strict'
var traceHelper = require('../helpers/traceHelper')
var helper = require('../helpers/util')
var util = require('../helpers/global')

class StorageResolver {
  constructor (_debugger, _traceManager) {
    this.debugger = _debugger
    this.traceManager = _traceManager
    this.clear()
    _debugger.event.register('newTraceLoaded', () => {
      this.clear()
    })
  }

  /**
    * return the storage for the current context (address and vm trace index)
    * by default now returns the range 0 => 1000
    *
    * @param {Function} - callback - contains a map: [hashedKey] = {key, hashedKey, value}
    */
  storageRange (callback) {
    storageRangeInternal(this, '0x0', 1000, callback)
  }

  /**
    * return a slot value for the current context (address and vm trace index)
    *
    * @param {Function} - callback - {key, hashedKey, value} -
    */
  storageSlot (slot, callback) {
    storageRangeInternal(this, slot, 100, function (error, storage) {
      if (error) {
        callback(error)
      } else {
        var hashed = helper.sha3(slot)
        callback(null, storage[hashed] !== undefined ? storage[hashed] : null)
      }
    })
  }

  /**
    * return True if the storage at @arg address is complete
    *
    * @param {String} address  - contract address
    * @return {Bool} - return True if the storage at @arg address is complete
    */
  isComplete (address) {
    return this.storageByAddress[address] && this.storageByAddress[address].complete
  }

  /**
    * retrieve the storage from the cache. if @arg slot is defined, return only the desired slot, if not return the entire known storage
    *
    * @param {String} address  - contract address
    * @param {String} slotKey  - key of the value to return
    * @return {String} - either the entire known storage or a single value
    */
  fromCache (address, slotKey) {
    if (!this.storageByAddress[address]) {
      return null
    }
    return slotKey ? this.storageByAddress[address].storage[slotKey] : this.storageByAddress[address].storage
  }

  /**
    * store the result of `storageRangeAtInternal`
    *
    * @param {String} address  - contract address
    * @param {Object} storage  - result of `storageRangeAtInternal`, contains {key, hashedKey, value}
    * @param {Bool} complete  - True if the storage is complete
    */
  toCache (address, storage, complete) {
    if (!this.storageByAddress[address]) {
      this.storageByAddress[address] = {}
    }
    this.storageByAddress[address].storage = Object.assign(this.storageByAddress[address].storage || {}, storage)
    if (complete !== undefined) {
      this.storageByAddress[address].complete = complete
    }
  }

  /**
    * clear the cache
    *
    */
  clear () {
    this.storageByAddress = {}
  }

  /**
    * resolve the storage to the specified execution step @arg index. uses the traceManager.resolveStorage
    *
    * @param {Int} index  - execution step index
    * @param {String} address  - contract address
    * @param {Map} storage  - Map of the known storage
    * @return {Map} - The storage resolved to the given exection point
    */
  resolveStorage (address, storage, callback) {
    this.traceManager.resolveStorage(this.debugger.currentStepIndex, address, storage, callback)
  }
}

function resolveAddress (self, callback) {
  self.traceManager.getCurrentCalledAddressAt(self.debugger.currentStepIndex, (error, result) => {
    if (error) {
      callback(error)
    } else {
      callback(null, result)
    }
  })
}

function storageRangeAtInternal (tx, address, start, maxSize, callback) {
  util.web3.debug.storageRangeAt(
    tx.blockHash, tx.transactionIndex === undefined ? tx.hash : tx.transactionIndex,
    address,
    start,
    maxSize,
    (error, result) => {
      if (error) {
        callback(error)
      } else if (result.storage) {
        callback(null, result.storage, result.complete)
      } else {
        callback('the storage has not been provided')
      }
    })
}

function storageRangeInternal (self, start, maxSize, callback) {
  resolveAddress(self, (error, address) => {
    if (error) {
      callback(error)
    } else {
      if (traceHelper.isContractCreation(address)) {
        callback(null, {})
      } else {
        if (!util.web3.debug.storageRangeAt) {
          callback('no storageRangeAt endpoint found')
        } else {
          if (self.isComplete(address)) {
            var cached = self.fromCache(address)
            self.resolveStorage(address, cached, callback)
          } else {
            storageRangeAtInternal(self.debugger.tx, address, start, maxSize, (error, storage, complete) => {
              if (error) {
                callback(error)
              } else {
                self.toCache(address, storage, complete)
                self.resolveStorage(address, storage, callback)
              }
            })
          }
        }
      }
    }
  })
}

module.exports = StorageResolver
