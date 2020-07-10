const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const expressWs = require('express-ws')
const Provider = require('./provider')
const log = require('./utils/logs.js')

class Server {
  constructor (options) {
    this.provider = new Provider(options)
    this.provider.init().then(() => {
      log('Provider initiated')
    }).catch((error) => {
      log(error)
    })
    this.rpcOnly = options.rpc
  }

  start (host, port) {
    expressWs(app)

    app.use(cors())
    app.use(bodyParser.urlencoded({extended: true}))
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
      log('Remix Simulator listening on ws://' + host + ':' + port)
      if (!this.rpcOnly) {
        log('http json-rpc is deprecated and disabled by default. To enable it use --rpc')
      }
    })
  }
}

module.exports = Server
