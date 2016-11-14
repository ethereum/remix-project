/**
  * determine what will be the start and end location of the current @arg type.
  *
  * @param {Object} type - current type ( see ./types/list.js )
  * @param {Object} positon - current position in storage
  * @return {Object} returns the start and end location of the current @arg type.
  */
function walkStorage (type, position) {
  var usedLocation = locationToFitType(type, position)
  return {
    currentLocation: usedLocation,
    endLocation: locationToEnd(type, usedLocation)
  }
}

/**
  * determine the start location of #arg type
  *
  * @param {Object} type - current type ( see ./types/list.js )
  * @param {Object} positon - current position in storage
  * @return {Object} returns the start position of the current @arg type.
  */
function locationToFitType (type, position) {
  if ((position.offset !== 0 && type.needsFreeStorageSlot) || (position.offset + type.storageBytes > 32 && !type.needsFreeStorageSlot)) {
    return {
      slot: position.slot + 1,
      offset: 0
    }
  } else {
    return {
      slot: position.slot,
      offset: position.offset
    }
  }
}

/**
  * determine the end location of #arg type
  *
  * @param {Object} type - current type ( see ./types/list.js )
  * @param {Object} positon - current position in storage
  * @return {Object} returns the end position of the current @arg type.
  */
function locationToEnd (type, positon) {
  if (positon.offset + type.storageBytes > 32) {
    var slots = Math.floor(type.storageBytes / 32) - 1
    return {
      slot: positon.slot + slots,
      offset: 32
    }
  } else {
    return {
      slot: positon.slot,
      offset: positon.offset + type.storageBytes
    }
  }
}

module.exports = {
  walkStorage: walkStorage
}
