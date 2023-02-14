'use strict'
import { util } from '@remix-project/remix-lib'

export class MockStorageResolver {

  storage

  constructor (_storage) {
    this.storage = {}
    for (const k in _storage) {
      const hashed = util.sha3_256(k)
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
    const hashed = util.sha3_256(slot)
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
