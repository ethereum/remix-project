var version = require('../../package.json').version
var web3 = require('web3')

var Misc = function () {
}

Misc.prototype.methods = function () {
  return {
    web3_clientVersion: this.web3_clientVersion.bind(this),
    eth_protocolVersion: this.eth_protocolVersion.bind(this),
    eth_syncing: this.eth_syncing.bind(this),
    eth_mining: this.eth_mining.bind(this),
    eth_hashrate: this.eth_hashrate.bind(this),
    web3_sha3: this.web3_sha3.bind(this)
  }
}

Misc.prototype.web3_clientVersion = function (payload, cb) {
  cb(null, 'Remix Simulator/' + version)
}

Misc.prototype.eth_protocolVersion = function (payload, cb) {
  cb(null, '0x3f')
}

Misc.prototype.eth_syncing = function (payload, cb) {
  cb(null, false)
}

Misc.prototype.eth_mining = function (payload, cb) {
  // TODO: should depend on the state
  cb(null, false)
}

Misc.prototype.eth_hashrate = function (payload, cb) {
  cb(null, '0x0')
}

Misc.prototype.web3_sha3 = function (payload, cb) {
  let str = payload.params[0]
  cb(null, web3.utils.sha3(str))
}

module.exports = Misc
