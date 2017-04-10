'use strict'
var traceHelper = require('../helpers/traceHelper')
var helper = require('../helpers/util')
var util = require('../helpers/global')

class StorageResolver {
  constructor (_traceManager) {
    this.traceManager = _traceManager
    this.clear()
  }

  /**
    * return the storage for the current context (address and vm trace index)
    * by default now returns the range 0 => 1000
    * @param {Object} - tx - transaction
    * @param {Int} - stepIndex - Index of the stop in the vm trace
    * @param {Function} - callback - contains a map: [hashedKey] = {key, hashedKey, value}
    */
  storageRange (tx, stepIndex, callback) {
    storageRangeInternal(this, '0x0', 1000, tx, stepIndex, callback)
  }

  /**
    * return a slot value for the current context (address and vm trace index)
    * @param {String} - slot - slot key
    * @param {Object} - tx - transaction
    * @param {Int} - stepIndex - Index of the stop in the vm trace
    * @param {Function} - callback - {key, hashedKey, value} -
    */
  storageSlot (slot, tx, stepIndex, callback) {
    storageRangeInternal(this, slot, 100, tx, stepIndex, function (error, storage) {
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
    * clear the cache
    *
    */
  clear () {
    this.storageByAddress = {}
  }

  /**
    * resolve the storage to the specified execution step @arg index. uses the traceManager.accumulateStorageChanges
    *
    * @param {Int} index  - execution step index
    * @param {String} address  - contract address
    * @param {Map} storage  - Map of the known storage
    * @param {Int} stepIndex  - vm trave index
    * @return {Map} - The storage resolved to the given exection point
    */
  accumulateStorageChanges (stepIndex, address, storage, callback) {
    this.traceManager.accumulateStorageChanges(stepIndex, address, storage, callback)
  }
}

function resolveAddress (self, stepIndex, callback) {
  self.traceManager.getCurrentCalledAddressAt(stepIndex, (error, result) => {
    if (error) {
      callback(error)
    } else {
      callback(null, result)
    }
  })
}

function storageRangeWeb3Call (tx, address, start, maxSize, callback) {
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

function storageRangeInternal (self, start, maxSize, tx, stepIndex, callback) {
  resolveAddress(self, stepIndex, (error, address) => {
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
            var cached = fromCache(self, address)
            self.accumulateStorageChanges(stepIndex, address, cached, callback)
          } else {
            storageRangeWeb3Call(tx, address, start, maxSize, (error, storage, complete) => {
              if (error) {
                callback(error)
              } else {
                toCache(self, address, storage, complete)
                self.accumulateStorageChanges(stepIndex, address, storage, callback)
              }
            })
          }
        }
      }
    }
  })
}

/**
    * retrieve the storage from the cache. if @arg slot is defined, return only the desired slot, if not return the entire known storage
    *
    * @param {String} address  - contract address
    * @param {String} slotKey  - key of the value to return
    * @return {String} - either the entire known storage or a single value
    */
function fromCache (self, address, slotKey) {
  if (!self.storageByAddress[address]) {
    return null
  }
  return slotKey ? self.storageByAddress[address].storage[slotKey] : self.storageByAddress[address].storage
}

/**
 * store the result of `storageRangeAtInternal`
 *
 * @param {String} address  - contract address
 * @param {Object} storage  - result of `storageRangeAtInternal`, contains {key, hashedKey, value}
 * @param {Bool} complete  - True if the storage is complete
 */
function toCache (self, address, storage, complete) {
  if (!self.storageByAddress[address]) {
    self.storageByAddress[address] = {}
  }
  self.storageByAddress[address].storage = Object.assign(self.storageByAddress[address].storage || {}, storage)
  if (complete !== undefined) {
    self.storageByAddress[address].complete = complete
  }
}

module.exports = StorageResolver
