
var Misc = function() {
}

Misc.prototype.methods = function () {
  return {
    web3_clientVersion: 'web3_clientVersion'
  }
}

Misc.prototype.web3_clientVersion = function (payload, cb) {
  cb(null, 'Remix Simulator/0.0.1')
}


module.exports = Misc;
