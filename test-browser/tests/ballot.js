'use strict';
var testData = require('../mockcompiler/requests');
// var contractHelper = require('../helpers/contracts');

module.exports = {
  'Ballot': function (browser) {
    runTests(browser, testData);
  }
};

function runTests (browser, testData) {
  browser
    .url('http://127.0.0.1:8080/#version=builtin')
    .waitForElementVisible('.newFile', 10000);
  browser.assert.notEqual(testData, null);
  // TODO add Ballot tests. -> setValue('#input textarea', ... ) is not working properly with that contract.
  /* testBallot(browser, testData.ballot.sources.Untitled1, function () {
    browser.end();
  });*/
}

/*
function testBallot (browser, contract, callback) {
  browser
    .click('.newFile')
    .clearValue('#input textarea')
    .setValue('#input textarea', contract, function () {
      browser.pause('10000');
      contractHelper.checkCompiledContracts(browser, ['Ballot'], callback);
    });
}*/
