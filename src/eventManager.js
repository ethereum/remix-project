'use strict'
function EventManager () {
  this.registered = {}
}

EventManager.prototype.unregister = function (eventName, obj) {
  for (var reg in this.registered[eventName]) {
    if (this.registered[eventName][reg] && this.registered[eventName][reg].obj === obj) {
      this.registered[eventName].splice(reg, 1)
      return
    }
  }
}

EventManager.prototype.register = function (eventName, obj, func) {
  if (!this.registered[eventName]) {
    this.registered[eventName] = []
  }
  this.registered[eventName].push({
    obj: obj,
    func: func
  })
}

EventManager.prototype.trigger = function (eventName, args) {
  for (var listener in this.registered[eventName]) {
    var l = this.registered[eventName][listener]
    l.func.apply(l.obj, args)
  }
}

module.exports = EventManager
