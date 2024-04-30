import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  "@disabled": true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Should select multiple items in file explorer #group1': function (browser: NightwatchBrowser) {
    const selectedElements = []
    browser
      .openFile('contracts')
      .click({ selector: '//*[@data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]', locateStrategy: 'xpath' })
      .findElement({ selector: '//*[@data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]', locateStrategy: 'xpath' }, (el) => {
        selectedElements.push(el)
      })
    browser.findElement({ selector: '//*[@data-id="treeViewLitreeViewItemtests"]', locateStrategy: 'xpath' },
      (el: any) => {
        selectedElements.push(el)
      })
    browser.selectFiles(selectedElements)
      .assert.visible('.bg-secondary[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
      .assert.visible('.bg-secondary[data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]')
      .assert.visible('.bg-secondary[data-id="treeViewLitreeViewItemtests"]')
  },
  'Should drag and drop multiple files in file explorer to tests folder #group1': function (browser: NightwatchBrowser) {
    const selectedElements = []
    browser
      .click({ selector: '//*[@data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]', locateStrategy: 'xpath' })
      .findElement({ selector: '//*[@data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]', locateStrategy: 'xpath' }, (el) => {
        selectedElements.push(el)
      })
    browser.selectFiles(selectedElements)
    .perform((done) => {
      browser.findElement({ selector: '//*[@data-id="treeViewLitreeViewItemtests"]', locateStrategy: 'xpath' },
      (el: any) => {
        const id = (el as any).value.getId()
        browser
          .waitForElementVisible('li[data-id="treeViewLitreeViewItemtests"]')
          .dragAndDrop('li[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]', id)
          .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
          .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
          .waitForElementVisible('li[data-id="treeViewLitreeViewItemtests/1_Storage.sol"]')
          .waitForElementVisible('li[data-id="treeViewLitreeViewItemtests/2_Owner.sol"]')
          .waitForElementNotPresent('li[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
          .waitForElementNotPresent('li[data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]')
          .perform(() => done())
      })
    })    
  },
  'should drag and drop multiple files and folders in file explorer to contracts folder #group3': function (browser: NightwatchBrowser) {
    const selectedElements = []
    browser
      .clickLaunchIcon('filePanel')
      .click({ selector: '//*[@data-id="treeViewLitreeViewItemtests"]', locateStrategy: 'xpath' })
      .findElement({ selector: '//*[@data-id="treeViewDivtreeViewItemREADME.txt"]', locateStrategy: 'xpath' }, (el) => {
        selectedElements.push(el)
      })
    browser.selectFiles(selectedElements)
    .perform((done) => {
      browser.findElement({ selector: '//*[@data-id="treeViewLitreeViewItemcontracts"]', locateStrategy: 'xpath' },
      (el: any) => {
        const id = (el as any).value.getId()
        browser
          .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts"]')
          .dragAndDrop('li[data-id="treeViewLitreeViewItemtests"]', id)
          .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
          .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
          .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/tests"]')
          .waitForElementVisible('li[data-id="treeViewLitreeViewItemcontracts/README.txt"]')
          .waitForElementNotPresent('li[data-id="treeViewLitreeViewItemtests"]')
          .waitForElementNotPresent('li[data-id="treeViewLitreeViewItemREADME.txt"]')
          .perform(() => done())
      })
    })    
  }
}
