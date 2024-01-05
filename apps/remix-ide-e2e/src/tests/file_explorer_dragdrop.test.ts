'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
    '@disabled': true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
    'drag and drop file from root to contracts #group1': async function (browser: NightwatchBrowser) {
        browser.findElement('li[data-id="treeViewLitreeViewItemcontracts"]', (el) => {
            console.log((el as any).value.getId())
            const id = (el as any).value.getId()
            browser
                .clickLaunchIcon('filePanel')
                .waitForElementVisible('li[data-id="treeViewLitreeViewItemREADME.txt"]')
                .dragAndDrop('li[data-id="treeViewLitreeViewItemREADME.txt"]', id)
                .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/README.txt"]')
        })
    }
}