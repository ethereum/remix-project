import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
const app = express()
import expressWs from 'express-ws'
import { Provider } from './provider'
import { Logger } from './utils/logs'
const logger = new Logger()

class Server {

  provider
  rpcOnly

  constructor (options) {
    this.provider = new Provider(options)
    this.provider.init().then(() => {
      logger.log('Provider initiated')
    }).catch((error) => {
      logger.log(error)
    })
    this.rpcOnly = options.rpc
  }

  start (host, port) {
    expressWs(app)

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
      app.ws('/', (ws, req) => {
        ws.on('message', (msg) => {
          this.provider.sendAsync(JSON.parse(msg), (err, jsonResponse) => {
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
      logger.log('Remix Simulator listening on ws://' + host + ':' + port)
      if (!this.rpcOnly) {
        logger.log('http json-rpc is deprecated and disabled by default. To enable it use --rpc')
      }
    })
  }
}

module.exports = Server
