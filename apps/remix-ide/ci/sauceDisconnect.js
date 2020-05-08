'use strict'

const https = require('https')

var userName = process.argv[2]
var accessKey = process.argv[3]
var tunnelName = process.argv[4]

function removeTunnel () {
  const requestPath = `/rest/v1/${userName}/tunnels`
  console.log(requestPath)
  callSauce(requestPath, 'GET', function (error, result) {
    if (error) {
      console.log(error)
    } else {
      var data = JSON.parse(result)
      for (var k in data) {
        retrieveTunnel(data[k], function (error, result) {
          if (error) {
            console.log(error)
          } else if (result.identtifier === tunnelName) {
            deleteTunnel(result.id, function () {
              console.log('tunnel deleted ' + data[k] + ' ' + tunnelName)
            })
          }
        })
      }
    }
  })
}

function retrieveTunnel (tunnelid, callback) {
  const requestPath = `/rest/v1/${userName}/tunnels/${tunnelid}`
  callSauce(requestPath, 'GET', function (error, result) {
    if (error) {
      callback(error)
    } else {
      callback(null, {'identtifier': JSON.parse(result).tunnel_identifier, 'id': tunnelid})
    }
  })
}

function deleteTunnel (tunnelid, callback) {
  const requestPath = `/rest/v1/${userName}/tunnels/${tunnelid}`
  callSauce(requestPath, 'DELETE', callback)
}

function callSauce (requestPath, type, callback) {
  function responseCallback (res) {
    res.setEncoding('utf8')
    console.log('Response: ', res.statusCode, JSON.stringify(res.headers))
    res.on('data', function onData (chunk) {
      console.log('BODY: ' + chunk)
      callback(null, chunk)
    })
    res.on('end', function onEnd () {})
  }

  var req = https.request({
    hostname: 'saucelabs.com',
    path: requestPath,
    method: type,
    auth: userName + ':' + accessKey
  }, responseCallback)

  req.on('error', function onError (e) {
    console.log('problem with request: ' + e.message)
    callback(e.message)
  })
  req.write('')
  req.end()
}

removeTunnel()
