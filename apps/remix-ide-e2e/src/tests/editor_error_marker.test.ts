'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {

  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', true)
  },

  'Should add error marker': function (browser: NightwatchBrowser) {
    browser
    .openFile('contracts')
    .openFile('contracts/1_Storage.sol')
    .addFile('scripts/adderror.ts', {content: addErrorMarker})
    .pause(4000)
    .executeScriptInTerminal('remix.exeCurrent()')
    .pause(4000)
    .openFile('contracts/1_Storage.sol')
    .useXpath()
    .waitForElementVisible("//*[@class='cdr squiggly-error']")
    .waitForElementVisible("//*[@class='cdr squiggly-warning']")
  },
  'Should clear error marker': function (browser: NightwatchBrowser) {
    browser 
    .useCss()
    .addFile('scripts/clear.ts', {content: clearMarkers})
    .pause(4000)
    .executeScriptInTerminal('remix.exeCurrent()')
    .pause(4000)
    .openFile('contracts/1_Storage.sol')
    .useXpath()
    .waitForElementNotPresent("//*[@class='cdr squiggly-error']")
    .waitForElementNotPresent("//*[@class='cdr squiggly-warning']")
  }
}

const clearMarkers =`
(async () => {
    await remix.call('editor', 'clearErrorMarkers' as any, ['contracts/1_Storage.sol'])
})()`

const addErrorMarker = `
(async () => {

 
    let errors = [
        {
            position: {
                start: {
                    line: 10,
                    column: 1,
                },
                end: {
                    line: 10,
                    column: 10
                }
            },
            message: 'testing',
            severity: 'error',
            file: 'contracts/1_Storage.sol'
        },
        {
            position: {
                start: {
                    line: 18,
                    column: 1,
                },
                end: {
                    line: 18,
                    column: 10
                }
            },
            message: 'testing2',
            severity: 'warning',
            file: 'contracts/1_Storage.sol'
        },
    ]


    await remix.call('editor', 'addErrorMarker' as any, errors)

    
})()`