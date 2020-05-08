const EventEmitter = require('events')

class CreateContract extends EventEmitter {
  command (inputParams) {
    this.api.perform((done) => {
      createContract(this.api, inputParams, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function createContract (browser, inputParams, callback) {
  browser.clickLaunchIcon('settings').clickLaunchIcon('udapp')
    .setValue('div[class^="contractActionsContainerSingle"] input', inputParams, function () {
      browser.click('#runTabView button[class^="instanceButton"]').pause(500).perform(function () { callback() })
    })
}

module.exports = CreateContract
