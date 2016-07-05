'use strict'
var Debugger = require('./Ethdebugger')
function init () {
  var container = document.getElementById('app')
  window.vmdebugger = new Debugger()
  container.appendChild(window.vmdebugger.render())
}

init()
