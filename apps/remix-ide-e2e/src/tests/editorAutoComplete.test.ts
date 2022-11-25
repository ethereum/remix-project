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

  'Should enable settings': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('settings')
      .click('[data-id="settingsAutoCompleteLabel"]')
      .click('[data-id="settingsShowGasLabel"]')
      .click('[data-id="displayErrorsLabel"]')
  },

  'Should add test and base files #group1': function (browser: NightwatchBrowser) {
    browser.addFile(examples.testContract.name, examples.testContract)
      .addFile(examples.baseContract.name, examples.baseContract)
      .addFile(examples.import1Contract.name, examples.import1Contract)
      .addFile(examples.baseOfBaseContract.name, examples.baseOfBaseContract)
      .addFile(examples.secondimport.name, examples.secondimport)
      .addFile(examples.importbase.name, examples.importbase)
      .openFile(examples.testContract.name)
  },
  'Should put cursor in the () of the function #group1': function (browser: NightwatchBrowser) {
    browser.scrollToLine(36)
    const path = "//*[@class='view-line' and contains(.,'myprivatefunction') and contains(.,'private')]//span//span[contains(.,'(')]"
    browser.waitForElementVisible('#editorView')
      .useXpath()
      .click(path).pause(1000)
  },
  'Should complete variable declaration types in a function definition #group1': function (browser: NightwatchBrowser) {
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
          sendKeys(' abc')
          .sendKeys(this.Keys.ENTER) // we need to split lines for FF texts to pass because the screen is too narrow
          .sendKeys(', testb')
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
          sendKeys(' btextbook')
          .sendKeys(this.Keys.ENTER)
          .sendKeys(', BaseB')
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
          sendKeys(' localbbook')
      }).pause(3000)
  },
  'Should put cursor at the end of function #group1': function (browser: NightwatchBrowser) {

    const path = "//*[@class='view-line' and contains(.,'localbbook') and contains(.,'private')]//span//span[contains(.,'{')]"
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
  'Should autcomplete address types #group1': function (browser: NightwatchBrowser) {
    browser
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('addre')
      })
      .waitForElementPresent(autoCompleteLineElement('address'))
      .click(autoCompleteLineElement('address'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(' someaddress;')
          .sendKeys(this.Keys.ENTER)
      }).pause(5000)
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('someaddress.')
      })
      .waitForElementVisible(autoCompleteLineElement('balance'))
      .waitForElementVisible(autoCompleteLineElement('send'))
      .waitForElementVisible(autoCompleteLineElement('transfer'))
      .waitForElementVisible(autoCompleteLineElement('code'))
      .click(autoCompleteLineElement('balance'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions
          .sendKeys(this.Keys.ENTER)
      })
  },
  'Should autcomplete array types #group1': function (browser: NightwatchBrowser) {
    browser
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('uin')
      })
      .waitForElementPresent(autoCompleteLineElement('uint'))
      .click(autoCompleteLineElement('uint'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('[] mem')
      })
      .waitForElementVisible(autoCompleteLineElement('memory'))
      .click(autoCompleteLineElement('memory'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(' somearray;')
      }
      ).pause(2000)
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions
          .sendKeys(this.Keys.ENTER)
          .sendKeys('somearray.')
      })
      .waitForElementVisible(autoCompleteLineElement('push'))
      .waitForElementVisible(autoCompleteLineElement('pop'))
      .waitForElementVisible(autoCompleteLineElement('length'))
      .click(autoCompleteLineElement('length'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions
          .sendKeys(this.Keys.ENTER)
      })
  },
  'Should see and autocomplete second import because it was imported by the first import #group1': function (browser: NightwatchBrowser) {
    browser
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('secondi')
      })
      .waitForElementPresent(autoCompleteLineElement('secondimport'))
      .click(autoCompleteLineElement('secondimport'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(' sec;')
          .sendKeys(this.Keys.ENTER)
      }).pause(3000)
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('sec.')
      })
      .waitForElementVisible(autoCompleteLineElement('secondimportstring'))
      .click(autoCompleteLineElement('secondimportstring'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(';')
          .sendKeys(this.Keys.ENTER)
      })

  },
  'Should see and autocomplete imported local class #group1': function (browser: NightwatchBrowser) {
    browser
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('import')
      })
      .waitForElementPresent(autoCompleteLineElement('importedcontract'))
      .click(autoCompleteLineElement('importedcontract'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys('.')
      })
      .waitForElementVisible(autoCompleteLineElement('externalimport'))
      .waitForElementVisible(autoCompleteLineElement('importbasestring'))
      .waitForElementVisible(autoCompleteLineElement('importedbook'))
      .waitForElementVisible(autoCompleteLineElement('importpublicstring'))
      .waitForElementVisible(autoCompleteLineElement('publicimport'))
      // no private 
      .waitForElementNotPresent(autoCompleteLineElement('importprivatestring'))
      .waitForElementNotPresent(autoCompleteLineElement('privateimport'))
      // no internal
      .waitForElementNotPresent(autoCompleteLineElement('importinternalstring'))
      .waitForElementNotPresent(autoCompleteLineElement('internalimport'))
      .click(autoCompleteLineElement('importbasestring'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(';')
          .sendKeys(this.Keys.ENTER)
      })

  },
  'Should autocomplete derived and local event when not using this. #group1': function (browser: NightwatchBrowser) {
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

  'Should type and get msg options #group1': function (browser: NightwatchBrowser) {
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
          sendKeys('.')
      })
      .waitForElementVisible(autoCompleteLineElement('balance'))
      .waitForElementVisible(autoCompleteLineElement('code'))
      .waitForElementVisible(autoCompleteLineElement('codehash'))
      .waitForElementVisible(autoCompleteLineElement('send'))
      .waitForElementVisible(autoCompleteLineElement('transfer'))
      .click(autoCompleteLineElement('balance'))
      .perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER)
      })
  },
  'Should bo and get book #group1': function (browser: NightwatchBrowser) {
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
  'Should autcomplete derived struct #group1': function (browser: NightwatchBrowser) {
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
  'Should bo and get basebook #group1': function (browser: NightwatchBrowser) {
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
  'Should autcomplete derived struct from base class #group1': function (browser: NightwatchBrowser) {
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
  'Should block scoped localbbook #group1': function (browser: NightwatchBrowser) {
    browser.pause(4000).
      perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER).
          sendKeys('localb')
      })
      .waitForElementVisible(autoCompleteLineElement('localbbook'))
      .click(autoCompleteLineElement('localbbook'))
  },
  'Should autcomplete derived struct from block localbbook #group1': function (browser: NightwatchBrowser) {
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
  'Should block scoped btextbook #group1': function (browser: NightwatchBrowser) {
    browser.
      perform(function () {
        const actions = this.actions({ async: true });
        return actions.
          sendKeys(this.Keys.ENTER).
          sendKeys('btext')
      })
      .waitForElementVisible(autoCompleteLineElement('btextbook'))
      .click(autoCompleteLineElement('btextbook'))
  },
  'Should autcomplete derived struct from block btextbook #group1': function (browser: NightwatchBrowser) {
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
  'Should find private and internal local functions #group1': function (browser: NightwatchBrowser) {
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
  'Should find internal functions and var from base and owner #group1': function (browser: NightwatchBrowser) {
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

  'Should not find external functions without this. #group1': function (browser: NightwatchBrowser) {
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
  'Should find external functions using this. #group1': function (browser: NightwatchBrowser) {
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
  'Should find public functions and vars using this. but not private & other types of nodes #group1': function (browser: NightwatchBrowser) {
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
  'Should autocomplete local and derived ENUMS #group1': function (browser: NightwatchBrowser) {
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