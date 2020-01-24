const EventEmitter = require('events')
class sendLowLevelTx extends EventEmitter {
  command (address, value, callData, callback) {
    this.api.perform((client, done) => {
      this.api.execute(function (value) {
        document.getElementById('deployAndRunLLTxSendTransaction').click
        done()
        if (callback) {
          callback.call(this.api)
        }
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = sendLowLevelTx
