/* global path */
var httpServer = require('http-server')
var remixd = require('remixd')

module.exports = (embark) => {
  var server = httpServer.createServer({
    root: path.join(__dirname, '/node_modules/remix-ide')
  })

  embark.registerServiceCheck('Remix IDE', (cb) => {
    return cb({name: 'Remix IDE (localhost:8080)', status: 'on'})
  })

  server.listen(8080, '127.0.0.1', function () {})
  var router = new remixd.Router()
  router.start(path.join(__dirname, '/../../'))
}
