'use strict';

module.exports = {
  'Smoke test': function (browser) {
    browser
      .url('http://127.0.0.1:8080/#version=builtin')
      .waitForElementVisible('#righthand-panel', 10000)
      .pause('10000')
      .assert.containsText('#righthand-panel', 'Solidity version')
      .end();
  }
};
