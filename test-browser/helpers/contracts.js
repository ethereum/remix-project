'use strict'

module.exports = {
  checkCompiledContracts: checkCompiledContracts,
  testContracts: testContracts
}

function checkCompiledContracts (browser, compiled, callback) {
  browser.elements('css selector', '.udapp .contract .title', function (elements) {
    elements.value.map(function (item, i) {
      browser.elementIdText(item.ELEMENT, function (text) {
        browser.assert.equal(text.value.split('\n')[0], compiled[i])
      })
    })
    callback()
  })
}

function testContracts (browser, contractCode, compiledContractNames, callback) {
  browser
      .clearValue('#input textarea')
      .click('.newFile')
      .setValue('#input textarea', contractCode, function () {})
      .waitForElementPresent('.contract .create', 5000, true, function () {
        checkCompiledContracts(browser, compiledContractNames, callback)
      })
}
