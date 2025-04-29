'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
    "@disable": true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },

    "test #group1": function (browser: NightwatchBrowser) {
        browser.pause(10000)
    }

}