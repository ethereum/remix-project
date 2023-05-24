import { NightwatchBrowser } from 'nightwatch'


module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    done()
  },
  'open app': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="startBtn"]')
      .click('*[data-id="startBtn"]')
      .pause()
      .end()
  }
}