'use strict'
module.exports = {
  formatMemory: function (mem, width) {
    var ret = ''
    if (!mem) {
      return ret
    }

    if (!mem.substr) {
      mem = mem.join('') // geth returns an array, eth return raw string
    }

    for (var k = 0; k < mem.length; k += (width * 2)) {
      var memory = mem.substr(k, width * 2)
      var content = this.tryConvertAsciiFormat(memory)
      ret += '0x' + k.toString(16) + '   ' + content.raw + ' ' + content.ascii + '\n'
    }
    return ret
  },

  tryConvertAsciiFormat: function (memorySlot) {
    var ret = { ascii: '', raw: '' }
    for (var k = 0; k < memorySlot.length; k += 2) {
      var raw = memorySlot.substr(k, 2)
      var ascii = String.fromCharCode(parseInt(raw, 16))
      ascii = ascii.replace(/\W/g, '?')
      if (ascii === '') {
        ascii = '?'
      }
      ret.ascii += ascii
      ret.raw += ' ' + raw
    }
    return ret
  }
}
