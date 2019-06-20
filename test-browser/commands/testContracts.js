const EventEmitter = require('events')

class TestContracts extends EventEmitter {
  command (fileName, contractCode, compiledContractNames) {
    this.api.perform((done) => {
      testContracts(this.api, fileName, contractCode, compiledContractNames, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function testContracts (browser, fileName, contractCode, compiledContractNames, callback) {
  browser
      .clickLaunchIcon('solidity')
      .clearValue('#input textarea')
      .addFile(fileName, contractCode)
      .pause(1000)
      .verifyContracts(compiledContractNames)
      .perform(() => {
        callback()
      })
}

module.exports = TestContracts
