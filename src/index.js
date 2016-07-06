'use strict'
var Debugger = require('./Ethdebugger')
function init () {
  var container = document.getElementById('app')
  container.vmdebugger = new Debugger()
  container.appendChild(container.vmdebugger.render())
}
init()
