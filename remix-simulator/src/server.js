const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const expressWs = require('express-ws')
const Provider = require('./provider')
const log = require('./utils/logs.js')

class Server {
  constructor (options) {
    this.provider = new Provider(options)
  }

  start (host, port) {
    expressWs(app)

    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    app.get('/', (req, res) => {
      res.send('Welcome to remix-simulator')
    })

    app.use((req, res) => {
      this.provider.sendAsync(req.body, (err, jsonResponse) => {
        if (err) {
          return res.send(JSON.stringify({error: err}))
        }
        res.send(jsonResponse)
      })
    })

    app.ws('/', (ws, req) => {
      ws.on('message', function (msg) {
        this.provider.sendAsync(JSON.parse(msg), (err, jsonResponse) => {
          if (err) {
            return ws.send(JSON.stringify({error: err}))
          }
          ws.send(JSON.stringify(jsonResponse))
        })
      })
    })

    app.listen(port, host, () => log('Remix Simulator listening on port ' + host + ':' + port))
  }
}

module.exports = Server
