'use strict'
import { util } from '@remix-project/remix-lib'

export class MockStorageResolver {

  storage

  constructor (_storage) {
    this.storage = {}
    for (var k in _storage) {
      var hashed = util.sha3_256(k)
      this.storage[hashed] = {
        hashed: hashed,
        key: k,
        value: _storage[k]
      }
    }
  }

  storageRange (callback) {
    callback(null, this.storage)
  }

  storageSlot (slot, callback) {
    var hashed = util.sha3_256(slot)
    callback(null, this.storage[hashed])
  }

  isComplete (address) {
    return true
  }

  fromCache (address, slotKey) {
    return this.storage[slotKey]
  }

  toCache (address, storage, complete) {
  }
}
