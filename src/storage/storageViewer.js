'use strict'
var helper = require('../helpers/util')

class StorageViewer {
  constructor (_context, _storageResolver) {
    this.context = _context
    this.storageResolver = _storageResolver
  }

  /**
   * return the storage for the current context (address and vm trace index)
   * by default now returns the range 0 => 1000
   *
   * @param {Function} - callback - contains a map: [hashedKey] = {key, hashedKey, value}
   */
  storageRange (callback) {
    this.storageResolver.storageRange(this.context.tx, this.context.stepIndex, callback)
  }

  /**
    * return a slot value for the current context (address and vm trace index)
    *
    * @param {Function} - callback - {key, hashedKey, value} -
    */
  storageSlot (slot, callback) {
    this.storageResolver.storageSlot(slot, this.context.tx, this.context.stepIndex, (error, result) => {
      if (error || !result || !result[slot]) {
        var hashed = helper.sha3_32(slot)
        this.storageResolver.storageSlot(hashed, this.context.tx, this.context.stepIndex, (error, result) => {
          if (error) {
            callback(error)
          } else {
            callback(null, result)
          }
        })
      } else {
        return callback(null, result)
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
