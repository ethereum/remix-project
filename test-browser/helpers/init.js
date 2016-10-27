module.exports = function (browser, callback) {
  browser
    .url('http://127.0.0.1:8080/#version=builtin')
    .injectScript('test-browser/helpers/applytestmode.js', function () {
      callback()
    })
}
