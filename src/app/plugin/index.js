'use strict'

class RemixExtension {
  constructor () {
    this._notifications = {}
    this._pendingRequests = {}
    this._id = 0
    window.addEventListener('message', (event) => this._newMessage(event), false)
  }

  listen (key, type, callback) {
    if (!this._notifications[key]) this._notifications[key] = {}
    this._notifications[key][type] = callback
  }

  call (key, type, params, callback) {
    this._id++
    this._pendingRequests[this._id] = callback
    window.parent.postMessage(JSON.stringify({
      action: 'request',
      key,
      type,
      value: params,
      id: this._id
    }), '*')
  }

  _newMessage (event) {
    if (!event.data) return
    if (typeof event.data !== 'string') return

    var msg
    try {
      msg = JSON.parse(event.data)
    } catch (e) {
      return console.log('unable to parse data')
    }
    const {action, key, type, value} = msg
    if (action === 'notification') {
      if (this._notifications[key] && this._notifications[key][type]) {
        this._notifications[key][type](value)
      }
    } else if (action === 'response') {
      const {id, error} = msg
      if (this._pendingRequests[id]) {
        this._pendingRequests[id](error, value)
        delete this._pendingRequests[id]
      }
    }
  }
}

if (window) window.RemixExtension = RemixExtension
if (module && module.exports) module.exports = RemixExtension

