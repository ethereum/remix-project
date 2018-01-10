module.exports = function (browser, callback) {
  browser
    .url('http://127.0.0.1:8080/#version=builtin')
    .injectScript('test-browser/helpers/applytestmode.js', function () {
      browser.resizeWindow(2560, 1440, callback)
       .click('#autoCompile')
       .perform(function () {
         callback()
       })
    })
}
