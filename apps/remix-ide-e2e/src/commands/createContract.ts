import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CreateContract extends EventEmitter {
  command (this: NightwatchBrowser, inputParams: string): NightwatchBrowser {
    this.api.perform((done) => {
      createContract(this.api, inputParams, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function createContract (browser: NightwatchBrowser, inputParams: string, callback: VoidFunction) {
  if (inputParams) {
    browser.setValue('.udapp_contractActionsContainerSingle > input', inputParams, function () {
      browser
        .pause(1000) // wait to get the button enabled
        .waitForElementVisible('.udapp_contractActionsContainerSingle button')
        .click('.udapp_contractActionsContainerSingle button').pause(500).perform(function () { callback() })
    })
  } else {
    browser
      .waitForElementVisible('.udapp_contractActionsContainerSingle button')
      .click('.udapp_contractActionsContainerSingle button')
      .pause(500)
      .perform(function () { callback() })
  }
}

module.exports = CreateContract
