module.exports = {
  'Smoke test': function (browser) {
    browser
      .url('http://127.0.0.1:8080')
      .waitForElementVisible('#righthand-panel', 10000)
      .assert.containsText('#righthand-panel', 'Solidity version')
      .end();
  }
};
