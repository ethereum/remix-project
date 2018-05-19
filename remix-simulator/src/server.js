const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Provider = require('./provider')
const log = require('./utils/logs.js')

var provider = new Provider()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to remix-simulator')
})

app.use(function (req, res) {
  provider.sendAsync(req.body, (err, jsonResponse) => {
    if (err) {
      res.send({error: err})
    }
    res.send(jsonResponse)
  })
})

app.listen(8545, () => log('Remix Simulator listening on port 8545!'))
