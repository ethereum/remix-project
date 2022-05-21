import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class CreateContract extends EventEmitter {
  command (this: NightwatchBrowser, inputParams: string[]): NightwatchBrowser {
    this.api.perform((done) => {
      createContract(this.api, inputParams, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function createContract (browser: NightwatchBrowser, inputParams: string[], callback: VoidFunction) {
  if (inputParams.length === 1) {
    browser.setValue('.udapp_contractActionsContainerSingle > input', inputParams[0], function () {
      browser.click('.udapp_contractActionsContainerSingle > button').pause(500).perform(function () { callback() })
    })
  } else if (inputParams.length > 1) {
    browser.perform((done) => {
      for (let i = 0; i < inputParams.length; i++) {
        browser.setValue(`div.udapp_multiArg:nth-child(${i + 1}) > input`, inputParams[i])
      }
      done()
    })
    .click('div.udapp_multiArg > button').pause(500).perform(function () { callback() })
  } else {
    browser
      .click('.udapp_contractActionsContainerSingle > button')
      .pause(500)
      .perform(function () { callback() })
  }
}

module.exports = CreateContract
