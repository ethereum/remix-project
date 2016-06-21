module.exports = {
  'Page Load': function (browser) {
    browser
      .url('http://127.0.0.1:8080')
      .end()
  }
}
