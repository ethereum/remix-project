
var Whisper = function () {
}

Whisper.prototype.methods = function () {
  return {
    shh_version: this.shh_version.bind(this)
  }
}

Whisper.prototype.shh_version = function (payload, cb) {
  cb(null, 5)
}

module.exports = Whisper
