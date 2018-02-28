'use strict'
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

class CmdInterpreter {
  constructor () {
    this.event = new EventManager()
  }
  interpret (cmd) {
    if (!cmd) return false
    var accept = commandsRegEx.exec(cmd)
    if (accept) {
      var param = accept[2]
      if (param) param = param.trim()
      this.event.trigger(accept[1], [param])
      return accept[1]
    }
    return null
  }
}

var commandsRegEx = /^remix:(debug|loadgist|setproviderurl|loadurl|batch)(.*)/

module.exports = CmdInterpreter
