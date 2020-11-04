import * as WS from 'ws'
import * as http from 'http'
import { WebsocketOpt, SharedFolderClient } from './types' // eslint-disable-line
import { getDomain } from './utils'
import { createClient } from '@remixproject/plugin-ws'
export default class WebSocket {
  server: http.Server
  wsServer: WS.Server

  constructor (public port: number, public opt: WebsocketOpt, public sharedFolder: SharedFolderClient) {} //eslint-disable-line

  start (callback?: (ws: WS) => void): void {
    this.server = http.createServer((request, response) => {
      console.log((new Date()) + ' Received request for ' + request.url)
      response.writeHead(404)
      response.end()
    })
    const loopback = '127.0.0.1'

    this.server.listen(this.port, loopback, function () {
      console.log((new Date()) + ' remixd is listening on ' + loopback + ':65520')
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
    this.wsServer.on('connection', (ws) => {
      const { sharedFolder } = this

      createClient(ws, sharedFolder as any)
      if (callback) callback(ws)
    })
  }

  close (): void {
    if (this.wsServer) {
      this.wsServer.close(() => {
        this.server.close()
      })
    }
  }
}

function originIsAllowed (origin: string, self: WebSocket): boolean {
  if (self.opt.remixIdeUrl) {
    if (self.opt.remixIdeUrl.endsWith('/')) self.opt.remixIdeUrl = self.opt.remixIdeUrl.slice(0, -1)
    return origin === self.opt.remixIdeUrl || origin === getDomain(self.opt.remixIdeUrl)
  } else {
    try {
      // eslint-disable-next-line
      const origins = require('./origins.json')
      const domain = getDomain(origin)
      const { data } = origins

      if (data.includes(origin) || data.includes(domain)) {
        self.opt.remixIdeUrl = origin
        console.log('\x1b[33m%s\x1b[0m', '[WARN] You may now only use IDE at ' + self.opt.remixIdeUrl + ' to connect to that instance')
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
