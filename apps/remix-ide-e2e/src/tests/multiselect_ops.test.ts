import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Should select multiple items in file explorer': function (browser: NightwatchBrowser) {
    const selectedElements = []
    browser
      .openFile('contracts')
    browser
      .click({ selector: '//*[@data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]', locateStrategy: 'xpath' })
    browser
      .findElement({ selector: '//*[@data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]', locateStrategy: 'xpath' }, (el) => {
        selectedElements.push(el)
      })
    browser
      .findElement({ selector: '//*[@data-id="treeViewLitreeViewItemtests"]', locateStrategy: 'xpath' }, (el) => {
        selectedElements.push(el)
      })
    browser.selectFiles(selectedElements)
  }
}

