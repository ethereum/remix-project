const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const expressWs = require('express-ws')
const Provider = require('./provider')
const log = require('./utils/logs.js')

expressWs(app)

var provider = new Provider()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to remix-simulator')
})

app.use((req, res) => {
  provider.sendAsync(req.body, (err, jsonResponse) => {
    if (err) {
      return res.send(JSON.stringify({error: err}))
    }
    res.send(jsonResponse)
  })
})

app.ws('/', (ws, req) => {
  ws.on('message', function (msg) {
    provider.sendAsync(JSON.parse(msg), (err, jsonResponse) => {
      if (err) {
        return ws.send(JSON.stringify({error: err}))
      }
      ws.send(JSON.stringify(jsonResponse))
    })
  })
})

app.listen(8545, () => log('Remix Simulator listening on port 8545!'))
