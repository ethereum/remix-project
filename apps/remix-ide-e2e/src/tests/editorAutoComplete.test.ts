'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import examples from '../examples/editor-test-contracts'

const autoCompleteLineElement = (name: string) => {
  return `//*[@class='editor-widget suggest-widget visible']//*[@class='contents' and contains(.,'${name}')]`
}

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080', false)
  },
  'Should add test and base files #group2': function (browser: NightwatchBrowser) {
    browser.addFile('contracts/test.sol', examples.testContract)
      .addFile('contracts/base.sol', examples.baseContract)
      .addFile('contracts/baseofbase.sol', examples.baseOfBaseContract)
      .openFile('contracts/test.sol').pause(3000)
  },
  'Should put cursor in the () of the function #group2': function (browser: NightwatchBrowser) {
    browser.scrollToLine(18)
    const path = "//*[@class='view-line' and contains(.,'myprivatefunction') and contains(.,'private')]//span//span[contains(.,'(')]"
    browser.waitForElementVisible('#editorView')
      .useXpath()
      .click(path).pause(1000)
  },
  'Should complete variable declaration types in a function definition #group2': function (browser: NightwatchBrowser) {
    browser
    .perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('uint25')
    })
    .waitForElementPresent(autoCompleteLineElement('uint256'))
    .click(autoCompleteLineElement('uint256'))
    .perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys(' abc, testb')
    })
    .waitForElementPresent(autoCompleteLineElement('"TestBookDefinition"'))
    .click(autoCompleteLineElement('"TestBookDefinition"'))
    .perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys(' memo')
    })
    .waitForElementPresent(autoCompleteLineElement('memory'))
    .click(autoCompleteLineElement('memory'))
    .perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys(' t, BaseB')
    })
    .waitForElementPresent(autoCompleteLineElement('"BaseBook"'))
    .click(autoCompleteLineElement('"BaseBook"'))
    .perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys(' stor')
    })
    .waitForElementPresent(autoCompleteLineElement('storage'))
    .click(autoCompleteLineElement('storage'))
    .perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys(' b')
    })
  },
  'Should put cursor at the end of function #group2': function (browser: NightwatchBrowser) {
    
    const path = "//*[@class='view-line' and contains(.,'myprivatefunction') and contains(.,'private')]//span//span[contains(.,'{')]"
    browser
      .useXpath()
      .click(path).pause(1000)
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          // right arrow key
          sendKeys(this.Keys.ARROW_RIGHT).
          sendKeys(this.Keys.ARROW_RIGHT)
      })
  },

  'Should autocomplete derived and local event when not using this. #group2': function (browser: NightwatchBrowser) {
    browser.perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('emit base')
    })
      .waitForElementVisible(autoCompleteLineElement('BaseEvent'))
      .click(autoCompleteLineElement('BaseEvent'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions
          .sendKeys('msg.sender')
          .sendKeys(this.Keys.TAB)
          .sendKeys(this.Keys.TAB) // somehow this is needed to get the cursor to the next parameter, only for selenium
          .sendKeys('3232')
          .sendKeys(this.Keys.TAB)
          .sendKeys(this.Keys.ENTER)
      })
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('emit MyEv')
      })
        .waitForElementVisible(autoCompleteLineElement('MyEvent'))
        .click(autoCompleteLineElement('MyEvent'))
        .perform(function () {
          const actions = this.actions({ async: true });
          return actions
            .sendKeys('3232')
            .sendKeys(this.Keys.TAB)
            .sendKeys(this.Keys.ENTER)
        })
  },

  'Should type and get msg options #group2': function (browser: NightwatchBrowser) {
    browser.
      perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER).
          sendKeys('msg.')
      })
      .waitForElementVisible(autoCompleteLineElement('sender'))
      .waitForElementVisible(autoCompleteLineElement('data'))
      .waitForElementVisible(autoCompleteLineElement('value'))
      .waitForElementVisible(autoCompleteLineElement('gas'))
      .waitForElementVisible(autoCompleteLineElement('sig'))
      .click(autoCompleteLineElement('sender'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(';').
          sendKeys(this.Keys.ENTER)
      })
  },
  'Should bo and get book #group2': function (browser: NightwatchBrowser) {
    browser.
      perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER).
          sendKeys('bo')
      })
      .waitForElementVisible(autoCompleteLineElement('book'))
      .click(autoCompleteLineElement('book'))
  },
  'Should autcomplete derived struct #group2': function (browser: NightwatchBrowser) {
    browser.perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('.')
    })
      .waitForElementVisible(autoCompleteLineElement('author'))
      .waitForElementVisible(autoCompleteLineElement('book_id'))
      .waitForElementVisible(autoCompleteLineElement('title'))
      .click(autoCompleteLineElement('title'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(';')
          .sendKeys(this.Keys.ENTER)
      })
  },
  'Should bo and get basebook #group2': function (browser: NightwatchBrowser) {
    browser.
      perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER).
          sendKeys('base')
      })
      .waitForElementVisible(autoCompleteLineElement('basebook'))
      .click(autoCompleteLineElement('basebook'))
  },
  'Should autcomplete derived struct from base class #group2': function (browser: NightwatchBrowser) {
    browser.perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('.')
    })
      .waitForElementVisible(autoCompleteLineElement('author'))
      .waitForElementVisible(autoCompleteLineElement('book_id'))
      .waitForElementVisible(autoCompleteLineElement('title'))
      .click(autoCompleteLineElement('title'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(';')
          .sendKeys(this.Keys.ENTER)
      })
  },
  'Should find private and internal local functions #group2': function (browser: NightwatchBrowser) {
    browser.perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('my')
    })
      .waitForElementVisible(autoCompleteLineElement('myprivatefunction'))
      .waitForElementVisible(autoCompleteLineElement('myinternalfunction'))
      .waitForElementVisible(autoCompleteLineElement('memory'))
      .click(autoCompleteLineElement('myinternalfunction'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER)
      })
  },
  'Should find internal functions and var from base and owner #group2': function (browser: NightwatchBrowser) {
    browser.perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('intern')
    })
      .waitForElementVisible(autoCompleteLineElement('internalbasefunction'))
      .waitForElementVisible(autoCompleteLineElement('internalstring'))
      .waitForElementVisible(autoCompleteLineElement('internalbasestring'))
      // keyword internal
      .waitForElementVisible(autoCompleteLineElement('internal keyword'))
      .click(autoCompleteLineElement('internalbasefunction'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions
          .sendKeys(this.Keys.ENTER)
      })
  },

  'Should not find external functions without this. #group2': function (browser: NightwatchBrowser) {
    browser.perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('extern')
    })
      .waitForElementNotPresent(autoCompleteLineElement('externalbasefunction'))
      .waitForElementNotPresent(autoCompleteLineElement('myexternalfunction'))
      // keyword internal
      .waitForElementVisible(autoCompleteLineElement('external keyword'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions
          .sendKeys(this.Keys.BACK_SPACE)
          .sendKeys(this.Keys.BACK_SPACE)
          .sendKeys(this.Keys.BACK_SPACE)
          .sendKeys(this.Keys.BACK_SPACE)
          .sendKeys(this.Keys.BACK_SPACE)
          .sendKeys(this.Keys.BACK_SPACE)
          .sendKeys(this.Keys.BACK_SPACE)
      })
  },
  'Should find external functions using this. #group2': function (browser: NightwatchBrowser) {
    browser.
      perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER).
          sendKeys('this.')
      })
      .waitForElementVisible(autoCompleteLineElement('externalbasefunction'))
      .waitForElementVisible(autoCompleteLineElement('myexternalfunction'))
  },
  'Should find public functions and vars using this. but not private & other types of nodes #group2': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible(autoCompleteLineElement('"publicbasefunction"'))
      .waitForElementVisible(autoCompleteLineElement('"publicstring"'))
      .waitForElementVisible(autoCompleteLineElement('"basebook"'))
      .waitForElementVisible(autoCompleteLineElement('"mybook"'))
      .waitForElementVisible(autoCompleteLineElement('"testing"'))
      // but no private functions or vars or other types of nodes
      .waitForElementNotPresent(autoCompleteLineElement('"private"'))
      .waitForElementNotPresent(autoCompleteLineElement('"BaseEvent"'))
      .waitForElementNotPresent(autoCompleteLineElement('"BaseEnum"'))
      .waitForElementNotPresent(autoCompleteLineElement('"TestBookDefinition"'))
      .click(autoCompleteLineElement('"publicbasefunction"'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions
          .sendKeys(this.Keys.ENTER)
      })
  },
  'Should autocomplete local and derived ENUMS #group2': function (browser: NightwatchBrowser) {
    browser.perform(function () {
      const actions = this.actions({ async: true });
      return actions.
        sendKeys('BaseEnum.')
    })
      .waitForElementVisible(autoCompleteLineElement('SMALL'))
      .waitForElementVisible(autoCompleteLineElement('MEDIUM'))
      .waitForElementVisible(autoCompleteLineElement('LARGE'))
      .click(autoCompleteLineElement('SMALL'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(';')
          .sendKeys(this.Keys.ENTER)
          .sendKeys('MyEnum.')
      })
      .waitForElementVisible(autoCompleteLineElement('SMALL'))
      .waitForElementVisible(autoCompleteLineElement('MEDIUM'))
      .waitForElementVisible(autoCompleteLineElement('LARGE'))
      .click(autoCompleteLineElement('SMALL'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(';')
          .sendKeys(this.Keys.ENTER)
      })
  }
}

