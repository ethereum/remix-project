var servicesList = require('./servicesList')
var Websocket = require('./websocket')

class Router {
  start (sharedFolder) {
    this.websocket = new Websocket()
    this.websocket.start((message) => {
      this.call(message.id, message.service, message.fn, message.args)
    })
    servicesList['sharedfolder'].setupNotifications(this.websocket, sharedFolder)
    servicesList['sharedfolder'].sharedFolder(sharedFolder)
  }

  call (callid, name, fn, args) {
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
  }
}

module.exports = Router
