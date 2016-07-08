'use strict'
var opcodes = require('./opcodes')

module.exports = {
  nameOpCodes: function (raw) {
    var pushData = ''
    var codeMap = {}
    var code = []

    for (var i = 0; i < raw.length; i++) {
      var pc = i
      var curOpCode = opcodes(raw[pc], false).name
      codeMap[i] = code.length
      // no destinations into the middle of PUSH
      if (curOpCode.slice(0, 4) === 'PUSH') {
        var jumpNum = raw[pc] - 0x5f
        pushData = raw.slice(pc + 1, pc + jumpNum + 1)
        i += jumpNum
      }

      var data = pushData.toString('hex') !== '' ? ' ' + pushData.toString('hex') : ''

      code.push(this.pad(pc, this.roundLog(raw.length, 10)) + ' ' + curOpCode + data)
      pushData = ''
    }
    return [ code, codeMap ]
  },

  pad: function (num, size) {
    var s = num + ''
    while (s.length < size) s = '0' + s
    return s
  },

  log: function (num, base) {
    return Math.log(num) / Math.log(base)
  },

  roundLog: function (num, base) {
    return Math.ceil(this.log(num, base))
  }
}
