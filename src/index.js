'use strict'
var Debugger = require('./Ethdebugger')

function init () {
  var ethdebugger = new Debugger()
  document.getElementById('app').appendChild(ethdebugger.render())
}

init()
