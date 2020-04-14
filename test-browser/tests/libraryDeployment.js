'use strict'
var init = require('../helpers/init')
var sauce = require('./sauce')

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  '@sources': function () {
    return sources
  },
  'Add Lib Test File': function (browser) {
    browser.addFile('Untitled5.sol', sources[0]['browser/Untitled5.sol'])
          .clickLaunchIcon('udapp')
          .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c') // this account will be used for this test suite
  },
  'Test Auto Deploy Lib': function (browser) {
    let addressRef
    browser.verifyContracts(['test'])
          .selectContract('test')
          .createContract('')
          .getAddressAtPosition(0, (address) => {
            console.log('testAutoDeployLib ' + address)
            addressRef = address
          })
          .waitForElementPresent('.instance:nth-of-type(2)')
          .click('.instance:nth-of-type(2) > div > button')
          .perform((done) => {
            browser.testConstantFunction(addressRef, 'get - call', '', '0: uint256: 45').perform(() => {
              done()
            })
          })
  },
  'Test Manual Deploy Lib': function (browser) {
    console.log('testManualDeployLib')
    browser.click('*[data-id="deployAndRunClearInstances"]')
          .pause(5000)
          .clickLaunchIcon('settings')
          .click('#generatecontractmetadata')
          .clickLaunchIcon('solidity')
          .click('#compileTabView button[title="Compile"]') // that should generate the JSON artefact
          .verifyContracts(['test'])
          .selectContract('lib') // deploy lib
          .createContract('')
          .perform((done) => {
            browser.getAddressAtPosition(0, (address) => {
              console.log(address)
              checkDeployShouldFail(browser, () => {
                checkDeployShouldSucceed(browser, address, () => {
                  done()
                })
              })
            })
          })
          .end()
  },
  tearDown: sauce
}

function checkDeployShouldFail (browser, callback) {
  let config
  browser.switchFile('browser/artifacts').switchFile('browser/artifacts/test.json')
        .getEditorValue((content) => {
          config = JSON.parse(content)
          config.deploy['VM:-'].autoDeployLib = false
        })
        .perform(() => {
          browser.setEditorValue(JSON.stringify(config))
        })
        .switchFile('browser/Untitled5.sol')
        .selectContract('test') // deploy lib
        .createContract('')
        .assert.containsText('div[class^="terminal"]', '<address> is not a valid address')
        .perform(() => { callback() })
}

function checkDeployShouldSucceed (browser, address, callback) {
  let addressRef
  let config
  browser.switchFile('browser/artifacts').switchFile('browser/artifacts/test.json')
        .getEditorValue((content) => {
          config = JSON.parse(content)
          config.deploy['VM:-'].autoDeployLib = false
          config.deploy['VM:-']['linkReferences']['browser/Untitled5.sol'].lib = address
        })
        .perform(() => {
          browser.setEditorValue(JSON.stringify(config))
        })
        .switchFile('browser/Untitled5.sol')
        .selectContract('test') // deploy lib
        .createContract('')
        .getAddressAtPosition(1, (address) => {
          addressRef = address
        })
        .waitForElementPresent('.instance:nth-of-type(3)')
        .click('.instance:nth-of-type(3) > div > button')
        .perform(() => {
          browser
            .testConstantFunction(addressRef, 'get - call', '', '0: uint256: 45')
            .perform(() => { callback() })
        })
}

var sources = [
  {
    'browser/Untitled5.sol': {content: `library lib {
      function getInt () public view returns (uint) {
          return 45;
      }
    }

    contract test {
      function get () public view returns (uint) {
          return lib.getInt();
      }
    }`}
  }
]
