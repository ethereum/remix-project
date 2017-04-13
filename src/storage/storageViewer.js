'use strict'
var helper = require('../helpers/util')

class StorageViewer {
  constructor (_context, _storageResolver, _traceManager) {
    this.context = _context
    this.storageResolver = _storageResolver
    _traceManager.accumulateStorageChanges(this.context.stepIndex, this.context.address, {}, (error, storageChanges) => {
      if (!error) {
        this.storageChanges = storageChanges
      } else {
        console.log(error)
      }
    })
  }

  /**
   * return the storage for the current context (address and vm trace index)
   * by default now returns the range 0 => 1000
   *
   * @param {Function} - callback - contains a map: [hashedKey] = {key, hashedKey, value}
   */
  storageRange (callback) {
    this.storageResolver.storageRange(this.context.tx, this.context.stepIndex, this.storageChanges, this.context.address, callback)
  }

  /**
    * return a slot value for the current context (address and vm trace index)
    * @param {String} - slot - slot key (not hashed key!)
    * @param {Function} - callback - {key, hashedKey, value} -
    */
  storageSlot (slot, callback) {
    var hashed = helper.sha3_32(slot)
    this.storageResolver.storageSlot(hashed, this.context.tx, this.context.stepIndex, this.storageChanges, this.context.address, (error, result) => {
      if (error) {
        callback(error)
      } else {
        callback(null, result)
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
    return this.storageResolver.isComplete(address)
  }
}

module.exports = StorageViewer
