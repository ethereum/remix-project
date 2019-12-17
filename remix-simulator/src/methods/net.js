
const Net = function () {
}

Net.prototype.methods = function () {
  return {
    net_version: this.net_version,
    net_listening: this.net_listening,
    net_peerCount: this.net_peerCount
  }
}

Net.prototype.net_version = function (payload, cb) {
  // should be configured networkId
  cb(null, 1337)
}

Net.prototype.net_listening = function (payload, cb) {
  cb(null, true)
}

Net.prototype.net_peerCount = function (payload, cb) {
  cb(null, 0)
}

module.exports = Net
