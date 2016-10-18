'use strict'

function eventManager () {
  this.registered = {}
}

/*
   * Unregister a listenner.
   * Note that if obj is a function. the unregistration will be applied to the dummy obj {}.
   *
   * @param {String} eventName  - the event name
   * @param {Object or Func} obj - object that will listen on this event
   * @param {Func} func         - function of the listenners that will be executed
*/
eventManager.prototype.unregister = function (eventName, obj, func) {
  if (obj instanceof Function) {
    func = obj
    obj = {}
  }
  for (var reg in this.registered[eventName]) {
    if (this.registered[eventName][reg] &&
      this.registered[eventName][reg].obj === obj && (!func || this.registered[eventName][reg].func === func)) {
      this.registered[eventName].splice(reg, 1)
      return
    }
  }
}

/*
   * Register a new listenner.
   * Note that if obj is a function, the function registration will be associated with the dummy object {}
   *
   * @param {String} eventName  - the event name
   * @param {Object or Func} obj - object that will listen on this event
   * @param {Func} func         - function of the listenners that will be executed
*/
eventManager.prototype.register = function (eventName, obj, func) {
  if (!this.registered[eventName]) {
    this.registered[eventName] = []
  }
  if (obj instanceof Function) {
    func = obj
    obj = {}
  }
  this.registered[eventName].push({
    obj: obj,
    func: func
  })
}

/*
   * trigger event.
   * Every listenner have their associated function executed
   *
   * @param {String} eventName  - the event name
   * @param {Array}j - argument that will be passed to the exectued function.
*/
eventManager.prototype.trigger = function (eventName, args) {
  for (var listener in this.registered[eventName]) {
    var l = this.registered[eventName][listener]
    l.func.apply(l.obj, args)
  }
}

module.exports = eventManager
