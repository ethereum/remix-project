'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {

  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', true)
  },

  'Should add line texts': function (browser: NightwatchBrowser) {
    browser
    .openFile('contracts')
    .openFile('contracts/1_Storage.sol')
    .addFile('scripts/addlinetext.ts', {content: addLineText})
    .pause(4000)
    .executeScriptInTerminal('remix.exeCurrent()')
    .pause(4000)
    .openFile('contracts/1_Storage.sol')
    .useXpath()
    .waitForElementVisible("//*[@class='view-line' and contains(.,'contract')]//span//span[contains(.,'mylinetext1')]")
    .waitForElementVisible("//*[@class='view-line' and contains(.,'function')]//span//span[contains(.,'mylinetext2')]")
  }
}

const addLineText = `
(async () => {

    await remix.call('editor', 'discardLineTexts' as any)
    let linetext = {
        content: 'mylinetext1',
        position: {
            start: {
                line: 9,
                column: 1,
            }
        },
        hide: false,
        className: 'text-muted small',
        afterContentClassName: 'text-muted small fas fa-gas-pump pl-4',
        hoverMessage: [{
            value: 'hovering1',
        },
        ],
    }

    await remix.call('editor', 'addLineText' as any, linetext, 'contracts/1_Storage.sol')


    linetext = {
        content: 'mylinetext2',
        position: {
            start: {
                line: 17,
                column: 1,
            }
        },
        hide: false,
        className: 'text-muted small',
        afterContentClassName: 'text-muted small fas fa-gas-pump pl-4',
        hoverMessage: [{
            value: 'hovering2',
        },
        ],
    }

    await remix.call('editor', 'addLineText' as any, linetext, 'contracts/1_Storage.sol')
    
})()`