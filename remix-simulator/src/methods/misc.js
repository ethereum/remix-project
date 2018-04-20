var version = require('../../package.json').version

var Misc = function () {
}

Misc.prototype.methods = function () {
  return {
    web3_clientVersion: this.web3_clientVersion.bind(this)
  }
}

Misc.prototype.web3_clientVersion = function (payload, cb) {
  cb(null, 'Remix Simulator/' + version)
}

module.exports = Misc
