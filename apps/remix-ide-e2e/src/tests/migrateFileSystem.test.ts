'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

declare global {
  interface Window { testmode: boolean; }
}

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?testmigration', false)
  },
  'Should load two workspaces': function (browser: NightwatchBrowser) {
    browser.pause(60000).end()
  }
}
