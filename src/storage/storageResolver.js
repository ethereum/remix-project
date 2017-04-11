'use strict'
var traceHelper = require('../helpers/traceHelper')
var helper = require('../helpers/util')
var util = require('../helpers/global')

class StorageResolver {
  constructor (_traceManager) {
    this.traceManager = _traceManager
    this.storageByAddress = {}
    this.maxSize = 100
  }

  /**
    * returns the storage for the given context (address and vm trace index)
    * returns the range 0x0 => this.maxSize
    *
    * @param {Object} - tx - transaction
    * @param {Int} - stepIndex - Index of the stop in the vm trace
    * @param {Function} - callback - contains a map: [hashedKey] = {key, hashedKey, value}
    */
  storageRange (tx, stepIndex, callback) {
    storageRangeInternal(this, '0x0', tx, stepIndex, true, callback)
  }

  /**
    * return a slot value for the given context (address and vm trace index)
    *
    * @param {String} - slot - slot key
    * @param {Object} - tx - transaction
    * @param {Int} - stepIndex - Index of the stop in the vm trace
    * @param {Function} - callback - {key, hashedKey, value} -
    */
  storageSlot (slot, tx, stepIndex, callback) {
    var hashed = helper.sha3_32(slot)
    storageRangeInternal(this, hashed, tx, stepIndex, false, function (error, storage) {
      if (error) {
        callback(error)
      } else {
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
}

/**
  * retrieve the storage and ensure at least @arg slot is cached.
  * - If @arg slot is already cached, the storage will be returned from the cache
  *   even if the next 1000 items are not in the cache.
  * - If @arg slot is not cached, the corresponding value will be resolved and the next 1000 slots.
  */
function storageRangeInternal (self, slotKey, tx, stepIndex, fullStorage, callback) {
  resolveAddress(self, stepIndex, (error, address) => {
    if (error) {
      return callback(error)
    }
    self.traceManager.accumulateStorageChanges(stepIndex, address, {}, (error, storageChanges) => {
      if (error) {
        return callback(error)
      }
      if (!fullStorage && storageChanges[slotKey]) {
        return callback(null, storageChanges)
      }
      var cached = fromCache(self, address, slotKey)
      if (cached && cached[slotKey]) { // we have the current slot in the cache and maybe the next 1000 ...
        return callback(null, Object.assign(cached, storageChanges))
      }
      storageRangeWeb3Call(tx, address, slotKey, self.maxSize, (error, storage, complete) => {
        if (error) {
          return callback(error)
        }
        toCache(self, address, storage)
        if (slotKey === '0x0' && Object.keys(storage).length < self.maxSize) {
          self.storageByAddress[address].complete = true
        }
        callback(null, Object.assign(storage, storageChanges))
      })
    })
  })
}

/**
  * retrieve the storage from the cache. if @arg slot is defined, return only the desired slot, if not return the entire known storage
  *
  * @param {String} address  - contract address
  * @param {String} slotKey  - key of the value to return
  * @return {String} - either the entire known storage or a single value
  */
function fromCache (self, address, hashedKey) {
  if (!self.storageByAddress[address]) {
    return null
  }
  return hashedKey ? self.storageByAddress[address].storage[hashedKey] : self.storageByAddress[address].storage
}

/**
 * store the result of `storageRangeAtInternal`
 *
 * @param {String} address  - contract address
 * @param {Object} storage  - result of `storageRangeAtInternal`, contains {key, hashedKey, value}
 */
function toCache (self, address, storage) {
  if (!self.storageByAddress[address]) {
    self.storageByAddress[address] = {}
  }
  self.storageByAddress[address].storage = Object.assign(self.storageByAddress[address].storage || {}, storage)
}

function storageRangeWeb3Call (tx, address, start, maxSize, callback) {
  if (traceHelper.isContractCreation(address)) {
    callback(null, {}, true)
  } else {
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

module.exports = StorageResolver
