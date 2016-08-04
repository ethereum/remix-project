'use strict';
function eventManager () {
  this.registered = {};
}

eventManager.prototype.unregister = function (eventName, obj, func) {
  if (obj instanceof Function) {
    func = obj;
    obj = {};
  }
  for (var reg in this.registered[eventName]) {
    if (this.registered[eventName][reg] &&
      this.registered[eventName][reg].obj === obj && (!func || this.registered[eventName][reg].func === func)) {
      this.registered[eventName].splice(reg, 1);
      return;
    }
  }
};

eventManager.prototype.register = function (eventName, obj, func) {
  if (!this.registered[eventName]) {
    this.registered[eventName] = [];
  }
  if (obj instanceof Function) {
    func = obj;
    obj = {};
  }
  this.registered[eventName].push({
    obj: obj,
    func: func
  });
};

eventManager.prototype.trigger = function (eventName, args) {
  for (var listener in this.registered[eventName]) {
    var l = this.registered[eventName][listener];
    l.func.apply(l.obj, args);
  }
};

module.exports = eventManager;
