import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  'Should select multiple items in the file explorer': function (browser: NightwatchBrowser) {
    browser
      .addFile('runTest.js', { content: testMultiselect })
      .keys(browser.Keys.SHIFT)
      .click('*[data-id="treeViewLitreeViewItemcontracts"]')
      .click('*[data-id=treeViewLitreeViewItemscripts')
      .click('*[data-id="treeViewLitreeViewItemtests"]')
      .executeScriptInTerminal('remix.exeCurrent()')
      .pause(2000)
      .execute(() => {
        browser.assert.ok((window as any).focusElements.length > 1, 'test passed')
      })
      .end()
  }
}

const testMultiselect = `
  const runThis = async () => {
    const result = await remix.call('fileManager', 'getFocusElements')

    console.log(result)
  }

  runThis()
`
