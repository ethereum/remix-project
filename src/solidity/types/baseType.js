'use strict'

module.exports = function (type, decoder) {
  type.needsFreeStorageSlot = decoder.needsFreeStorageSlot
  type.storageBytes = decoder.storageBytes
  type.typeName = decoder.typeName
  type.decoder = decoder.decoder
}
