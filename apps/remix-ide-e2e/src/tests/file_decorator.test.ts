
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
        .addFile('scripts/decorators.ts', { content: testScript })
        .pause(2000)
        .executeScript('remix.exeCurrent()')
        .pause(4000)
        .useXpath()
        .waitForElementContainsText('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-error-contracts/2_Owner.sol"]', '2')
        .waitForElementContainsText('//*[@class="mainview"]//*[@data-id="file-decoration-error-contracts/2_Owner.sol"]', '2')
        .waitForElementContainsText('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-custom-contracts/2_Owner.sol"]', 'U')
        .waitForElementContainsText('//*[@class="mainview"]//*[@data-id="file-decoration-custom-contracts/2_Owner.sol"]', 'U')
        .waitForElementContainsText('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-warning-contracts/1_Storage.sol"]', '2')
        .waitForElementContainsText('//*[@class="mainview"]//*[@data-id="file-decoration-warning-contracts/1_Storage.sol"]', '2')
        .useCss()
        .waitForElementNotPresent('[data-id="file-decoration-custom-contracts/3_Ballot.sol"]', 10000)
        .useXpath()
        .moveToElement('//*[@id="fileExplorerView"]//*[@data-id="file-decoration-error-contracts/2_Owner.sol"]', 0,0)
        .waitForElementVisible('//*[@id="error-tooltip-contracts/2_Owner.sol"]')
        .waitForElementContainsText('//*[@id="error-tooltip-contracts/2_Owner.sol"]', 'error on owner')
    }

}
const testScript = `
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
                    owner: 'code-parser',
                    bubble: true,
                    commment: 'error on owner',
                }
    let decorator2: any = {
                    path: 'contracts/2_Owner.sol',
                    isDirectory: false,
                    fileStateType: 'CUSTOM',
                    fileStateLabelClass: 'text-success',
                    fileStateIconClass: 'text-success',
                    fileStateIcon: 'U',
                    text: '',
                    owner: 'code-parser',
                    bubble: true,
                    commment: 'modified',
                }
    remix.call('fileDecorator' as any, 'setFileDecorators', [decorator, decorator2])
    
    decorator = {
                    path: 'contracts/1_Storage.sol',
                    isDirectory: false,
                    fileStateType: 'WARNING',
                    fileStateLabelClass: 'text-warning',
                    fileStateIconClass: '',
                    fileStateIcon: '',
                    text: '2',
                    owner: 'code-parser',
                    bubble: true,
                    commment: 'warning on storage',
                }
    remix.call('fileDecorator' as any, 'setFileDecorators', decorator)
    
    decorator = {
                    path: 'contracts/3_Ballot.sol',
                    isDirectory: false,
                    fileStateType: 'CUSTOM',
                    fileStateLabelClass: '',
                    fileStateIconClass: '',
                    fileStateIcon: 'customtext',
                    text: 'w',
                    owner: 'dgit',
                    bubble: true,
                    commment: '',
                }
    remix.call('fileDecorator' as any, 'setFileDecorators', decorator)
    
    remix.call('fileDecorator' as any, 'clearFileDecorators', 'dgit')
    
    })()`