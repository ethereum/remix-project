'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    browser
    .url('http://127.0.0.1:8080')
    .pause(6000)
    .maximizeWindow().perform(() => {
        done()
    })
  },

  testMe: function(browser: NightwatchBrowser) {
    browser.waitForElementPresent('[id="remixTourSkipbtn"]').isVisible('[id="remixTourSkipbtn"]').click('[id="remixTourSkipbtn"]')
  }
}