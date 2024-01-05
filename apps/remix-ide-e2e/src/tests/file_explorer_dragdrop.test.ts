'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
    '@disabled': true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done)
    },
    'drag and drop file from root to contracts #group1 #flaky': function (browser: NightwatchBrowser) {
        browser
            .clickLaunchIcon('filePanel')
            .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
            .findElement('*[data-id="treeViewLitreeViewItemcontracts"]', (el) => {
                console.log((el as any).value.getId())
                const id = (el as any).value.getId()
                browser
                    .waitForElementVisible('li[data-id="treeViewLitreeViewItemREADME.txt"]')
                    .dragAndDrop('li[data-id="treeViewLitreeViewItemREADME.txt"]', id)
                    .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
                    .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
                    .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/README.txt"]')
            })
    },

    'drag and drop file from contracts to root #group1': function (browser: NightwatchBrowser) {
        browser.findElement('*[data-id="treeViewUltreeViewMenu"]', (el) => {
            console.log((el as any).value.getId())
            const id = (el as any).value.getId()
            browser
                .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
                .dragAndDrop('li[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]', id)
                .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
                .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
        })
        browser.pause(1000)
            .waitForElementVisible('li[data-id="treeViewLitreeViewItem1_Storage.sol"]')
    },
    'drag and drop scripts from root to contracts #group1': function (browser: NightwatchBrowser) {
        browser
            .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
            .findElement('*[data-id="treeViewLitreeViewItemcontracts"]', (el) => {
                console.log((el as any).value.getId())
                const id = (el as any).value.getId()
                browser
                    .waitForElementVisible('li[data-id="treeViewLitreeViewItemscripts"]')
                    .dragAndDrop('li[data-id="treeViewLitreeViewItemscripts"]', id)
                    .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
                    .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
                    .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/scripts"]')
            })
    },
    'drag scripts from contracts to root #group1': function (browser: NightwatchBrowser) {
        browser.findElement('*[data-id="treeViewUltreeViewMenu"]', (el) => {
            console.log((el as any).value.getId())
            const id = (el as any).value.getId()
            browser
                .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/scripts"]')
                .dragAndDrop('li[data-id="treeViewLitreeViewItemcontracts/scripts"]', id)
                .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
                .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
        })
        browser.pause(1000)
            .waitForElementVisible('li[data-id="treeViewLitreeViewItemscripts"]')
    },
    'drag into nested folder': function (browser: NightwatchBrowser) {
        browser.waitForElementVisible('li[data-id="treeViewLitreeViewItemscripts"]')
            .rightClick('li[data-id="treeViewLitreeViewItemscripts"]')
            .waitForElementPresent('[data-id="contextMenuItemnewFolder')
            .click('[data-id="contextMenuItemnewFolder')
            .waitForElementVisible('*[data-id$="/blank"] .remixui_items')
            .sendKeys('*[data-id$="/blank"] .remixui_items', 'nested')
            .sendKeys('*[data-id$="/blank"] .remixui_items', browser.Keys.ENTER)
            .findElement('*[data-id="treeViewLitreeViewItemscripts/nested"]', (el) => {
                console.log((el as any).value.getId())
                const id = (el as any).value.getId()
                browser
                    .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/README.txt"]')
                    .dragAndDrop('li[data-id="treeViewLitreeViewItemcontracts/README.txt"]', id)
                    .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
                    .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
                    .waitForElementVisible('li[data-id="treeViewLitreeViewItemscripts/nested/README.txt"]')
            })
    }



}