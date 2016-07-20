module.exports = {
  'Debugger Render': function (browser) {
    browser
      .url('http://127.0.0.1:8080')
      .waitForElementPresent('#debugger', 10000)
      .waitForElementPresent('#debugger #slider', 10000)
      .end();
  }
};
