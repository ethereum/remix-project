import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import expressWs from 'express-ws'
import { Provider, ProviderOptions } from './provider'
import { log } from './utils/logs'
const app = express()

class Server {
  provider
  rpcOnly

  constructor (options?:ProviderOptions) {
    this.provider = new Provider(options)
    this.provider.init().then(() => {
      log('Provider initiated')
    }).catch((error) => {
      log(error)
    })
    this.rpcOnly = options.rpc
  }

  start (host, port) {
    const wsApp = expressWs(app)

    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    app.get('/', (req, res) => {
      res.send('Welcome to remix-simulator')
    })

    if (this.rpcOnly) {
      app.use((req, res) => {
        this.provider.sendAsync(req.body, (err, jsonResponse) => {
          if (err) {
            return res.send(JSON.stringify({ error: err }))
          }
          res.send(jsonResponse)
        })
      })
    } else {
      wsApp.app.ws('/', (ws, req) => {
        ws.on('message', (msg) => {
          this.provider.sendAsync(JSON.parse(msg.toString()), (err, jsonResponse) => {
            if (err) {
              return ws.send(JSON.stringify({ error: err }))
            }
            ws.send(JSON.stringify(jsonResponse))
          })
        })

        this.provider.on('data', (result) => {
          ws.send(JSON.stringify(result))
        })
      })
    }

    app.listen(port, host, () => {
      if (!this.rpcOnly) {
        log('Remix Simulator listening on ws://' + host + ':' + port)
        log('http json-rpc is deprecated and disabled by default. To enable it use --rpc')
      } else {
        log('Remix Simulator listening on http://' + host + ':' + port)
      }
    })
  }
}

module.exports = Server
