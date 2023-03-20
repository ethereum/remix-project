
'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {

    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },

    'Test decorators with script': function (browser: NightwatchBrowser) {
        browser
            .openFile('contracts')
            .openFile('contracts/2_Owner.sol')
            .openFile('contracts/1_Storage.sol')
            .openFile('contracts/3_Ballot.sol')
            .addFile('scripts/decorators.ts', { content: testScriptSet })
            .pause(2000)
            .executeScriptInTerminal('remix.exeCurrent()')
            .pause(4000)
            .useXpath()
            .waitForElementContainsText('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-error-contracts/2_Owner.sol"]', '2')
            .waitForElementContainsText('//*[@class="mainview"]//*[@data-id="file-decoration-error-contracts/2_Owner.sol"]', '2')
            .waitForElementContainsText('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-custom-contracts/2_Owner.sol"]', 'U')
            .waitForElementContainsText('//*[@class="mainview"]//*[@data-id="file-decoration-custom-contracts/2_Owner.sol"]', 'U')
            .waitForElementContainsText('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-warning-contracts/1_Storage.sol"]', '2')
            .waitForElementContainsText('//*[@class="mainview"]//*[@data-id="file-decoration-warning-contracts/1_Storage.sol"]', '2')
            .waitForElementContainsText('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-custom-contracts/3_Ballot.sol"]', 'customtext')
            .waitForElementContainsText('//*[@class="mainview"]//*[@data-id="file-decoration-custom-contracts/3_Ballot.sol"]', 'customtext')
            .moveToElement('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-error-contracts/2_Owner.sol"]', 0, 0)
            //.waitForElementVisible('//*[@id="error-tooltip-contracts/2_Owner.sol"]')
            //.waitForElementContainsText('//*[@id="error-tooltip-contracts/2_Owner.sol"]', 'error on owner')
    },

    'clear ballot decorator': function (browser: NightwatchBrowser) {
        browser
            .useCss()
            .addFile('scripts/clearballot.ts', { content: testScriptClearBallot })
            .pause(2000)
            .executeScriptInTerminal('remix.exeCurrent()')
            .pause(4000)
            .waitForElementNotPresent('[data-id="file-decoration-custom-contracts/3_Ballot.sol"]', 10000)
    },
    'clear all decorators': function (browser: NightwatchBrowser) {
        browser
            .addFile('scripts/clearall.ts', { content: testScriptClear })
            .pause(2000)
            .executeScriptInTerminal('remix.exeCurrent()')
            .pause(4000)
            .waitForElementNotPresent('[data-id="file-decoration-error-contracts/2_Owner.sol"]', 10000)
            .waitForElementNotPresent('[data-id="file-decoration-warning-contracts/1_Storage.sol"]', 10000)
    }


}
const testScriptSet = `
(async () => {
    remix.call('fileDecorator' as any, 'clearFileDecorators')
    let decorator: any = {
                    path: 'contracts/2_Owner.sol',
                    isDirectory: false,
                    fileStateType: 'ERROR',
                    fileStateLabelClass: 'text-danger',
                    fileStateIconClass: '',
                    fileStateIcon: '',
                    text: '2',
                    bubble: true,
                    comment: 'error on owner',
                }
    let decorator2: any = {
                    path: 'contracts/2_Owner.sol',
                    isDirectory: false,
                    fileStateType: 'CUSTOM',
                    fileStateLabelClass: 'text-success',
                    fileStateIconClass: 'text-success',
                    fileStateIcon: 'U',
                    text: '',
                    bubble: true,
                    comment: 'modified',
                }
    await remix.call('fileDecorator' as any, 'setFileDecorators', [decorator, decorator2])
    
    decorator = {
                    path: 'contracts/1_Storage.sol',
                    isDirectory: false,
                    fileStateType: 'WARNING',
                    fileStateLabelClass: 'text-warning',
                    fileStateIconClass: '',
                    fileStateIcon: '',
                    text: '2',
                    bubble: true,
                    comment: 'warning on storage',
                }
    await remix.call('fileDecorator' as any, 'setFileDecorators', decorator)
    
    decorator = {
                    path: 'contracts/3_Ballot.sol',
                    isDirectory: false,
                    fileStateType: 'CUSTOM',
                    fileStateLabelClass: '',
                    fileStateIconClass: '',
                    fileStateIcon: 'customtext',
                    text: 'with text',
                    bubble: true,
                    comment: 'custom comment',
                }
    await remix.call('fileDecorator' as any, 'setFileDecorators', decorator)
    
    })()`


const testScriptClearBallot = `
    (async () => {
        
    await remix.call('fileDecorator' as any, 'clearFileDecorators', 'contracts/3_Ballot.sol')
        
        })()`

const testScriptClear = `
    (async () => {
        await remix.call('fileDecorator' as any, 'clearAllFileDecorators')
        
        
        })()`