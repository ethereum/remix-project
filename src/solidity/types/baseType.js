'use strict'

module.exports = function (type, decoder) {
  type.storageSlots = decoder.storageSlots
  type.storageBytes = decoder.storageBytes
  type.typeName = decoder.typeName
  type.decoder = decoder.decoder
}
