const EventEmitter = require('events')

class SelectContract extends EventEmitter {
  command (contractName) {
    this.api.perform((done) => {
      selectContract(this.api, contractName, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function selectContract (browser, contractName, callback) {
  browser.clickLaunchIcon('settings').clickLaunchIcon('run')
  .setValue('#runTabView select[class^="contractNames"]', contractName).perform(() => {
    callback()
  })
}

module.exports = SelectContract
