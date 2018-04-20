const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Provider = require('./provider')

var provider = new Provider()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to remix-simulator')
});

app.use(function(req,res) { 
  // url, body, params, method
  console.log("request ", req.method, req.body)
  provider.sendAsync(req.body, (err, jsonResponse) => {
    console.dir("response is ")
    console.dir(jsonResponse)
    res.send(jsonResponse)
  });
});

app.listen(8545, () => console.log('Example app listening on port 8545!'))

