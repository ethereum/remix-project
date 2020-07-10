const version = require('../../package.json').version
const web3 = require('web3')

const Misc = function () {
}

Misc.prototype.methods = function () {
  return {
    web3_clientVersion: this.web3_clientVersion.bind(this),
    eth_protocolVersion: this.eth_protocolVersion.bind(this),
    eth_syncing: this.eth_syncing.bind(this),
    eth_mining: this.eth_mining.bind(this),
    eth_hashrate: this.eth_hashrate.bind(this),
    web3_sha3: this.web3_sha3.bind(this),
    eth_getCompilers: this.eth_getCompilers.bind(this),
    eth_compileSolidity: this.eth_compileSolidity.bind(this),
    eth_compileLLL: this.eth_compileLLL.bind(this),
    eth_compileSerpent: this.eth_compileSerpent.bind(this)
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
  const str = payload.params[0]
  cb(null, web3.utils.sha3(str))
}

Misc.prototype.eth_getCompilers = function (payload, cb) {
  cb(null, [])
}

Misc.prototype.eth_compileSolidity = function (payload, cb) {
  cb(null, 'unsupported')
}

Misc.prototype.eth_compileLLL = function (payload, cb) {
  cb(null, 'unsupported')
}

Misc.prototype.eth_compileSerpent = function (payload, cb) {
  cb(null, 'unsupported')
}

module.exports = Misc
