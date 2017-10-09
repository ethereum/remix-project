module.exports = {
  shortenAddress: function (address, etherBalance) {
    var len = address.length
    return address.slice(0, 5) + '...' + address.slice(len - 5, len) + (etherBalance ? ' (' + etherBalance.toString() + ' ether)' : '')
  },
  shortenHexData: function (data) {
    if (!data) return ''
    if (data.length < 5) return data
    var len = data.length
    return data.slice(0, 5) + '...' + data.slice(len - 5, len)
  },
  createNonClashingName (path, fileProvider) {
    var counter = ''
    if (path.endsWith('.sol')) path = path.substring(0, path.lastIndexOf('.sol'))
    while (fileProvider.exists(path + counter + '.sol')) {
      counter = (counter | 0) + 1
    }
    return path + counter + '.sol'
  },
  checkSpecialChars (name) {
    return name.match(/[/:*?"<>\\'|]/) != null
  }
}
