var servicesList = require('./servicesList')
var Websocket = require('./websocket')

class Router {
  start (sharedFolder) {
    var websocket = new Websocket()
    this.websocket = websocket
    this.websocket.start((message) => {
      this.call(message.id, message.service, message.fn, message.args)
    })
    servicesList['sharedfolder'].setWebSocket(this.websocket)
    servicesList['sharedfolder'].setupNotifications(sharedFolder)
    servicesList['sharedfolder'].sharedFolder(sharedFolder)
    console.log('Shared folder : ' + sharedFolder)
    return function () {
      if (websocket) {
        websocket.close()
      }
    }
  }

  call (callid, name, fn, args) {
    try {
      servicesList[name][fn](args, (error, data) => {
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
