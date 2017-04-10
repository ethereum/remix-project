'use strict'

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
    this.storageResolver.storageSlot(slot, this.context.tx, this.context.stepIndex, callback)
  }

  /**
    * return True if the storage at @arg address is complete
    *
    * @param {String} address  - contract address
    * @return {Bool} - return True if the storage at @arg address is complete
    */
  isComplete (address) {
    return this.storageResolver.storageRange(address)
  }
}

module.exports = StorageViewer
