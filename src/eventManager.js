'use strict'
module.exports = {
  registered: {},

  register: function (eventName, obj, func) {
    if (!this.registered[eventName]) {
      this.registered[eventName] = []
    }
    this.registered[eventName].push({
      obj: obj,
      func: func
    })
  },

  trigger: function (eventName, args) {
    for (var listener in this.registered[eventName]) {
      var l = this.registered[eventName][listener]
      l.func.apply(l.obj, args)
    }
  }

}
