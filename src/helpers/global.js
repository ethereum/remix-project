'use strict'
module.exports = {
  extend: function (destination, source) {
    for (var property in source) {
      destination[property] = source[property]
    }
  },
  web3: null
}
