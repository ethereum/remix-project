'use strict'

module.exports = {
  listSelectorContains: listSelectorContains
}

function listSelectorContains (textsToFind, selector, browser, callback) {
  browser.execute(function (selector) {
    var items = document.querySelectorAll(selector)
    var ret = []
    for (var k = 0; k < items.length; k++) {
      ret.push(items[k].innerText)
    }
    return ret
  }, [selector], function (result) {
    console.log(result.value)
    for (var k in textsToFind) {
      console.log('testing ' + result.value[k] + ' against ' + textsToFind[k])
      browser.assert.equal(result.value[k].indexOf(textsToFind[k]) !== -1, true)
    }
    callback()
  })
}

