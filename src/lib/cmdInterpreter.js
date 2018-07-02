'use strict'
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var CommandInterpreterAPI = require('./cmdInterpreterAPI')

class CmdInterpreter {
  constructor () {
    this.event = new EventManager()
    this.api = new CommandInterpreterAPI(this)
  }
  interpret (cmd, cb) {
    if (!cmd) return false
    var accept = commandsRegEx.exec(cmd)
    if (accept) {
      var param = accept[2]
      if (param) param = param.trim()
      this.api[accept[1]](param, cb)
      return accept[1]
    }
    return null
  }
}

var commandsRegEx = /^remix:(debug|loadgist|setproviderurl|loadurl|batch)(.*)/

module.exports = CmdInterpreter
