
module.exports = {
  decodeMappingsKeys: decodeMappingsKeys
}

/**
  * extract the mappings location from the storage
  * like { "<mapping_slot>" : { "<mapping-key1>": preimageOf1 }, { "<mapping-key2>": preimageOf2 }, ... }
  *
  * @param {Object} storage  - storage given by storage Viewer (basically a mapping hashedkey : {key, value})
  * @param {Function} callback  - calback
  * @return {Map} - solidity mapping location (e.g { "<mapping_slot>" : { "<mapping-key1>": preimageOf1 }, { "<mapping-key2>": preimageOf2 }, ... })
  */
async function decodeMappingsKeys (web3, storage, callback) {
  var ret = {}
  for (var hashedLoc in storage) {
    var preimage
    try {
      preimage = await getPreimage(web3, storage[hashedLoc].key)
    } catch (e) {
    }
    if (preimage) {
      // got preimage!
      // get mapping position (i.e. storage slot), its the last 32 bytes
      var slotByteOffset = preimage.length - 64
      var mappingSlot = preimage.substr(slotByteOffset)
      var mappingKey = preimage.substr(0, slotByteOffset)
      if (!ret[mappingSlot]) {
        ret[mappingSlot] = {}
      }
      ret[mappingSlot][mappingKey] = preimage
    }
  }
  callback(null, ret)
}

/**
  * Uses web3 to return preimage of a key
  *
  * @param {String} key  - key to retrieve the preimage of
  * @return {String} - preimage of the given key
  */
function getPreimage (web3, key) {
  return new Promise((resolve, reject) => {
    web3.debug.preimage(key.indexOf('0x') === 0 ? key : '0x' + key, function (error, preimage) {
      if (error) {
        resolve(null)
      } else {
        resolve(preimage)
      }
    })
  })
}
