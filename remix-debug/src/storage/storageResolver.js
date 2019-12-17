'use strict'
const remixLib = require('remix-lib')
const traceHelper = remixLib.helpers.trace
const mappingPreimages = require('./mappingPreimages')

/**
  * Basically one instance is created for one debugging session.
  * (TODO: one instance need to be shared over all the components)
  */
class StorageResolver {
  constructor (options) {
    this.storageByAddress = {}
    this.preimagesMappingByAddress = {}
    this.maxSize = 100
    this.web3 = options.web3
    this.zeroSlot = '0x0000000000000000000000000000000000000000000000000000000000000000'
  }

  /**
   * returns the storage for the given context (address and vm trace index)
   * returns the range 0x0 => this.maxSize
   *
   * @param {Object} - tx - transaction
   * @param {Int} - stepIndex - Index of the stop in the vm trace
   * @param {String} - address - lookup address
   * @param {Function} - callback - contains a map: [hashedKey] = {key, hashedKey, value}
   */
  storageRange (tx, stepIndex, address, callback) {
    this.storageRangeInternal(this, this.zeroSlot, tx, stepIndex, address, callback)
  }

  /**
   * compute the mappgings type locations for the current address (cached for a debugging session)
   * note: that only retrieve the first 100 items.
   *
   * @param {Object} tx
   * @param {Int} stepIndex
   * @param {Object} address  - storage
   * @param {Array} corrections - used in case the calculated sha3 has been modifyed before SSTORE (notably used for struct in mapping).
   * @return {Function} - callback
   */
  initialPreimagesMappings (tx, stepIndex, address, corrections, callback) {
    if (this.preimagesMappingByAddress[address]) {
      return callback(null, this.preimagesMappingByAddress[address])
    }
    this.storageRange(tx, stepIndex, address, (error, storage) => {
      if (error) {
        return callback(error)
      }
      mappingPreimages.decodeMappingsKeys(this.web3, storage, corrections, (error, mappings) => {
        if (error) {
          callback(error)
        } else {
          this.preimagesMappingByAddress[address] = mappings
          callback(null, mappings)
        }
      })
    })
  }

  /**
   * return a slot value for the given context (address and vm trace index)
   *
   * @param {String} - slot - slot key
   * @param {Object} - tx - transaction
   * @param {Int} - stepIndex - Index of the stop in the vm trace
   * @param {String} - address - lookup address
   * @param {Function} - callback - {key, hashedKey, value} -
   */
  storageSlot (slot, tx, stepIndex, address, callback) {
    this.storageRangeInternal(this, slot, tx, stepIndex, address, (error, storage) => {
      if (error) {
        callback(error)
      } else {
        callback(null, storage[slot] !== undefined ? storage[slot] : null)
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
   * retrieve the storage and ensure at least @arg slot is cached.
   * - If @arg slot is already cached, the storage will be returned from the cache
   *   even if the next 1000 items are not in the cache.
   * - If @arg slot is not cached, the corresponding value will be resolved and the next 1000 slots.
   */
  storageRangeInternal (self, slotKey, tx, stepIndex, address, callback) {
    var cached = this.fromCache(self, address)
    if (cached && cached.storage[slotKey]) { // we have the current slot in the cache and maybe the next 1000...
      return callback(null, cached.storage)
    }
    this.storageRangeWeb3Call(tx, address, slotKey, self.maxSize, (error, storage, nextKey) => {
      if (error) {
        return callback(error)
      }
      if (!storage[slotKey] && slotKey !== self.zeroSlot) { // we don't cache the zero slot (could lead to inconsistency)
        storage[slotKey] = {
          key: slotKey,
          value: self.zeroSlot
        }
      }
      self.toCache(self, address, storage)
      if (slotKey === self.zeroSlot && !nextKey) { // only working if keys are sorted !!
        self.storageByAddress[address].complete = true
      }
      callback(null, storage)
    })
  }

  /**
   * retrieve the storage from the cache. if @arg slot is defined, return only the desired slot, if not return the entire known storage
   *
   * @param {String} address  - contract address
   * @return {String} - either the entire known storage or a single value
   */
  fromCache (self, address) {
    if (!self.storageByAddress[address]) {
      return null
    }
    return self.storageByAddress[address]
  }

  /**
   * store the result of `storageRangeAtInternal`
   *
   * @param {String} address  - contract address
   * @param {Object} storage  - result of `storageRangeAtInternal`, contains {key, hashedKey, value}
   */
  toCache (self, address, storage) {
    if (!self.storageByAddress[address]) {
      self.storageByAddress[address] = {}
    }
    self.storageByAddress[address].storage = Object.assign(self.storageByAddress[address].storage || {}, storage)
  }

  storageRangeWeb3Call (tx, address, start, maxSize, callback) {
    if (traceHelper.isContractCreation(address)) {
      callback(null, {}, null)
    } else {
      this.web3.debug.storageRangeAt(
        tx.blockHash, tx.transactionIndex === undefined ? tx.hash : tx.transactionIndex,
        address,
        start,
        maxSize,
        (error, result) => {
          if (error) {
            callback(error)
          } else if (result.storage) {
            callback(null, result.storage, result.nextKey)
          } else {
            callback('the storage has not been provided')
          }
        })
    }
  }
}

module.exports = StorageResolver
