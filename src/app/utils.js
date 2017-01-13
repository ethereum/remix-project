'use strict'

function errortype (message) {
  return message.match(/^(.*:[0-9]*:[0-9]* )?Warning: /) ? 'warning' : 'error'
}

module.exports = {
  errortype: errortype
}
