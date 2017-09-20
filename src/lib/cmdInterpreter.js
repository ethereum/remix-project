'use strict'
var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager

class CmdInterpreter {
  constructor () {
    this.event = new EventManager()
  }
  interpret (cmd) {
    if (!cmd) return false
    var accept = commandsRegEx.exec(cmd)
    if (accept) {
      this.event.trigger(accept[1], [cmd.replace(commandsRegEx, '')])
      return accept[1]
    }
    return null
  }
}

var commandsRegEx = /^remix:(debug|loadgist|setproviderurl|loadswarm)\s/

module.exports = CmdInterpreter
