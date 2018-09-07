var Websocket = require('./websocket')

class Router {
  constructor (port, service, initCallback) {
    this.port = port
    this.service = service
    this.initCallback = initCallback
  }
  start () {
    var websocket = new Websocket(this.port)
    this.websocket = websocket
    this.websocket.start((message) => {
      this.call(message.id, message.service, message.fn, message.args)
    })
    if (this.initCallback) this.initCallback(this.websocket)
    return function () {
      if (websocket) {
        websocket.close()
      }
    }
  }

  call (callid, name, fn, args) {
    try {
      this.service[fn](args, (error, data) => {
        var response = {
          id: callid,
          type: 'reply',
          scope: name,
          result: data,
          error: error
        }
        this.websocket.send(JSON.stringify(response))
      })
    } catch (e) {
      var msg = 'Unexpected Error ' + e.message
      console.log('\x1b[31m%s\x1b[0m', '[ERR] ' + msg)
      if (this.websocket) {
        this.websocket.send(JSON.stringify({
          id: callid,
          type: 'reply',
          scope: name,
          error: msg
        }))
      }
    }
  }
}

module.exports = Router
