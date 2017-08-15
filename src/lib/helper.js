module.exports = {
  shortenAddress: function (address, etherBalance) {
    var len = address.length
    return address.slice(0, 5) + '...' + address.slice(len - 5, len) + (etherBalance ? ' (' + etherBalance.toString() + ' ether)' : '')
  },
  shortenHexData: function (data) {
    if (data.length < 5) return data
    var len = data.length
    return data.slice(0, 5) + '...' + data.slice(len - 5, len)
  }
}
