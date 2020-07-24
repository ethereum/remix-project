module.exports = {
  before: function (browser, done) {
      done()
  },
  'Test Computation': function (browser) {
    browser
    .url('https://google.com')
  }
}