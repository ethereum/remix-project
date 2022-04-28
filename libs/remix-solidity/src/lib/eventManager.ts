'use strict'

export default class EventManager {
  registered: any = {} // eslint-disable-line
  anonymous: any = {} // eslint-disable-line

  /*
   * Unregister a listener.
   * Note that if obj is a function. the unregistration will be applied to the dummy obj {}.
   *
   * @param {String} eventName  - the event name
   * @param {Object or Func} obj - object that will listen on this event
   * @param {Func} func         - function of the listeners that will be executed
 */
  unregister (eventName: any, obj: any, func: any): void { // eslint-disable-line
    if (!this.registered[eventName]) {
      return
    }
    if (obj instanceof Function) {
      func = obj
      obj = this.anonymous
    }
    for (const reg in this.registered[eventName]) {
      if (this.registered[eventName][reg].obj === obj && this.registered[eventName][reg].func.toString() === func.toString()) {
        this.registered[eventName].splice(reg, 1)
      }
    }
  }

  /*
   * Register a new listener.
   * Note that if obj is a function, the function registration will be associated with the dummy object {}
   *
   * @param {String} eventName  - the event name
   * @param {Object or Func} obj - object that will listen on this event
   * @param {Func} func         - function of the listeners that will be executed
  */
  register (eventName: any, obj: any, func: any): void { // eslint-disable-line
    if (!this.registered[eventName]) {
      this.registered[eventName] = []
    }
    if (obj instanceof Function) {
      func = obj
      obj = this.anonymous
    }
    this.registered[eventName].push({
      obj: obj,
      func: func
    })
  }

  /*
   * trigger event.
   * Every listener have their associated function executed
   *
   * @param {String} eventName  - the event name
   * @param {Array}j - argument that will be passed to the executed function.
  */
  trigger (eventName: any, args: any): void { // eslint-disable-line
    if (!this.registered[eventName]) {
      return
    }
    for (const listener in this.registered[eventName]) {
      const l = this.registered[eventName][listener]
      if (l.func) l.func.apply(l.obj === this.anonymous ? {} : l.obj, args)
    }
  }
}
