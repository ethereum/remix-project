module.exports = {
  extractValue: function (slotValue, storageBytes, location) {
    slotValue = slotValue.replace('0x', '')
    var offset = slotValue.length - 2 * location.offset - storageBytes / 4
    if (offset >= 0) {
      return '0x' + slotValue.substr(offset, storageBytes / 4)
    } else if (offset + storageBytes > 0) {
      return '0x' + slotValue.substr(0, storageBytes / 4 + offset)
    } else {
      return '0x0'
    }
  }
}
