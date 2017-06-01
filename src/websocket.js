#!/usr/bin/env node
var WebSocketServer = require('websocket').server
var http = require('http')

class WebSocket {
  constructor () {
    this.connection = null
  }

  start (callback) {
    var server = http.createServer(function (request, response) {
      console.log((new Date()) + ' Received request for ' + request.url)
      response.writeHead(404)
      response.end()
    })
    server.listen(65520, function () {
      console.log((new Date()) + ' Remixd is listening on port 65520')
    })

    this.wsServer = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false
    })

    this.wsServer.on('request', (request) => {
      if (!originIsAllowed(request.origin)) {
        request.reject()
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
        return
      }
      if (this.connection) {
        console.log('closing previous connection')
        this.wsServer.closeAllConnections()
        this.connection = null
        return
      }

      this.connection = request.accept('echo-protocol', request.origin)
      console.log((new Date()) + ' Connection accepted.')
      this.connection.on('message', (message) => {
        if (message.type === 'utf8') {
          callback(JSON.parse(message.utf8Data))
        }
      })
      this.connection.on('close', (reasonCode, description) => {
        console.log((new Date()) + ' Remix ' + this.connection.remoteAddress + ' disconnected.')
        this.connection = null
      })
    })
  }

  send (data) {
    this.connection.sendUTF(data)
  }
}

function originIsAllowed (origin) {
  console.log('origin', origin)
  return true
}

module.exports = WebSocket
