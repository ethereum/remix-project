module.exports = {
  'New file test': function (browser) {
    browser
      .url('http://127.0.0.1:8080')
      .waitForElementVisible('.newFile', 5000)
      .click('.newFile')
      .assert.containsText('.active', 'Untitled')
      .end();
  }
};
