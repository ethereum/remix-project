import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
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
      .end()
  }
}
