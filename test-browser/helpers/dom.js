'use strict'

module.exports = {
  listSelectorContains: listSelectorContains
}

function listSelectorContains (textsToFind, selector, browser, callback) {
  browser
    .elements('css selector', selector, function (warnings) {
      warnings.value.map(function (warning, index) {
        browser.elementIdText(warning.ELEMENT, function (text) {
          browser.assert.equal(text.value.indexOf(textsToFind[index]) !== -1, true)
          if (index === warnings.value.length - 1) {
            callback()
          }
        })
      })
    })
}

