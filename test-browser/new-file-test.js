'use strict';

module.exports = {
  'New file test': function (browser) {
    browser
      .url('http://127.0.0.1:8080')
      .waitForElementVisible('.newFile', 10000)
      .click('.newFile')
      .pause('10000')
      .assert.containsText('.active', 'Untitled')
      .end();
  }
};
