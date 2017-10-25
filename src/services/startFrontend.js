const serve = require('serve')

module.exports = function (path, port) {
  var server = serve(path, {
    port: port
  })

  function kill () {
    console.log('stopping frontend')
    server.stop()
  }
  return kill
}
