import { sub } from '../solidity-decoder/types/util'

/**
  * extract the mappings location from the storage
  * like { "<mapping_slot>" : { "<mapping-key1>": preimageOf1 }, { "<mapping-key2>": preimageOf2 }, ... }
  *
  * @param {Object} storage  - storage given by storage Viewer (basically a mapping hashedkey : {key, value})
  * @param {Array} corrections - used in case the calculated sha3 has been modifyed before SSTORE (notably used for struct in mapping).
  * @param {Function} callback  - calback
  * @return {Map} - solidity mapping location (e.g { "<mapping_slot>" : { "<mapping-key1>": preimageOf1 }, { "<mapping-key2>": preimageOf2 }, ... })
  */
export async function decodeMappingsKeys (web3, storage, corrections) {
  const ret = {}
  if (!corrections.length) corrections.push({ offset: 0, slot: 0 })
  for (const hashedLoc in storage) {
    let preimage
    try {
      const key = storage[hashedLoc].key
      for (const k in corrections) {
        const corrected = sub(key, corrections[k].slot).toString(16)
        preimage = await getPreimage(web3, '0x' + corrected)
        if (preimage) break
      }
    } catch (e) {} // eslint-disable-line no-empty
    if (preimage) {
      // got preimage!
      // get mapping position (i.e. storage slot), its the last 32 bytes
      const slotByteOffset = preimage.length - 64
      const mappingSlot = preimage.substr(slotByteOffset)
      const mappingKey = preimage.substr(0, slotByteOffset)
      if (!ret[mappingSlot]) {
        ret[mappingSlot] = {}
      }
      ret[mappingSlot][mappingKey] = preimage
    }
  }
  return ret
}

/**
  * Uses web3 to return preimage of a key
  *
  * @param {String} key  - key to retrieve the preimage of
  * @return {String} - preimage of the given key
  */
function getPreimage (web3, key) {
  return new Promise((resolve, reject) => {
    web3.debug.preimage(key.indexOf('0x') === 0 ? key : '0x' + key, (error, preimage) => {
      if (error) {
        return resolve(null)
      }
      resolve(preimage)
    })
  })
}
