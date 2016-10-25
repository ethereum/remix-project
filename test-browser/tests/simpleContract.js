'use strict';
var testData = require('../mockcompiler/requests');
var contractHelper = require('../helpers/contracts');

module.exports = {
  'Simple Contract': function (browser) {
    runTests(browser, testData);
  }
};

function runTests (browser, testData) {
  browser
    .url('http://127.0.0.1:8080/#version=builtin')
    .waitForElementVisible('.newFile', 10000);
  browser.assert.notEqual(testData, null);
  testSimpleContract(browser, testData.testSimpleContract.sources.Untitled1, function () {
    browser.end();
  });
}

function testSimpleContract (browser, contract, callback) {
  browser
    .click('.newFile')
    .clearValue('#input textarea')
    .setValue('#input textarea', contract)
    .pause('5000');
  contractHelper.checkCompiledContracts(browser, ['test1', 'test2'], callback);
}
