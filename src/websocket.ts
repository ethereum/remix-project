import * as WS from 'ws'
import * as http from 'http'
import RemixdClient from './services/remixdClient'
import { WebsocketOpt } from '../types'

const { buildWebsocketClient } = require('@remixproject/plugin-ws')

export default class WebSocket {
  server: http.Server
  wsServer: WS.Server

  constructor (public port: number, public opt: WebsocketOpt, public remixdClient: RemixdClient) {}

  start (callback?: Function) {
    const obj = this

    this.server = http.createServer((request, response) => {
      console.log((new Date()) + ' Received request for ' + request.url)
      response.writeHead(404)
      response.end()
    })
    const loopback = '127.0.0.1'

    this.server.listen(this.port, loopback, function () {
      console.log((new Date()) + ' Remixd is listening on ' + loopback + ':65520')
    })
    this.wsServer = new WS.Server({
      server: this.server,
      verifyClient: (info, done) => {
        if (!originIsAllowed(info.origin, this)) {
          done(false)
          console.log((new Date()) + ' Connection from origin ' + info.origin + ' rejected.')
          return
        }
        done(true)
      }
    })
    this.wsServer.on('connection', function connection(ws, request) {
      const client = buildWebsocketClient(ws, obj.remixdClient)

      if(callback) callback(client)
    })
  }

  close () {
    if (this.wsServer) {
      this.wsServer.close(() => {
        this.server.close()
      })
    }
  }
}

function originIsAllowed (origin: string, self: WebSocket) {
  return origin === self.opt.remixIdeUrl
}
