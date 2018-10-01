module.exports = function (path, port) {
  console.log('\x1b[31m%s\x1b[0m', '[ERR] Front end capability is not available anymore')
  function kill () {}
  return kill
}
