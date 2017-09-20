'use strict'
var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager

class CmdInterpreter {
  constructor () {
    this.event = new EventManager()
  }
  interpret (cmd) {
    if (!cmd) return false
    for (var c in commands) {
      if (commands[c].exec(cmd)) {
        commands[c].action(this, cmd)
        return true
      }
    }
    return false
  }
}

var commands = [
  {
    command: /^debug /,
    action: (self, command) => {
      self.event.trigger('debug', command.replace('debug ', ''))
    }
  }
]

module.exports = CmdInterpreter
