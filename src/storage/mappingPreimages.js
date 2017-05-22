var global = require('../helpers/global')

module.exports = {
  extractMappingPreimages: extractMappingPreimages
}

/**
 * Uses the storageViewer to retrieve the storage and returns a mapping containing possible solidity mappping type location.
 * like { "<mapping_slot>" : { "<mapping-key1>": preimageOf1 }, { "<mapping-key2>": preimageOf2 }, ... }
 *
 * @param {Object} address  - storageViewer
 * @return {Map} - solidity mapping location
 */
async function extractMappingPreimages (storageViewer) {
  return new Promise((resolve, reject) => {
    storageViewer.storageRange(function (error, storage) {
      if (!error) {
        decodeMappingsKeys(storage, (error, mappings) => {
          if (error) {
            reject(error)
          } else {
            resolve(mappings)
          }
        })
      } else {
        reject(error)
      }
    })
  })
}

/**
 * Uses the storageViewer to retrieve the storage and returns a mapping containing possible solidity mappping type location.
 * like { "<mapping_slot>" : { "<mapping-key1>": preimageOf1 }, { "<mapping-key2>": preimageOf2 }, ... }
 *
 * @param {Object} storage  - storage given by storage Viewer (basically a mapping hashedkey : {key, value})
 * @param {Function} callback  - calback
 * @return {Map} - solidity mapping location (e.g { "<mapping_slot>" : { "<mapping-key1>": preimageOf1 }, { "<mapping-key2>": preimageOf2 }, ... })
 */
async function decodeMappingsKeys (storage, callback) {
  var ret = {}
  for (var hashedLoc in storage) {
    var preimage
    try {
      preimage = await getPreimage(storage[hashedLoc].key)
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
function getPreimage (key) {
  return new Promise((resolve, reject) => {
    global.web3.debug.preimage(key, function (error, preimage) {
      if (error) {
        reject(error)
      } else {
        resolve(preimage)
      }
    })
  })
}
