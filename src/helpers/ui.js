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
      ret += '0x' + (k / 2).toString(16) + '\t\t' + content.raw + '\t' + content.ascii + '\n'
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
      ret.raw += raw
    }
    return ret
  },

  formatCss: function (css1, css2) {
    var ret = ''
    for (var arg in arguments) {
      for (var k in arguments[arg]) {
        if (arguments[arg][k] && ret.indexOf(k) === -1) {
          ret += k + ':' + arguments[arg][k] + ';'
        }
      }
    }
    return ret
  },

  normalizeHex: function (hex) {
    if (hex.indexOf('0x') === 0) {
      hex = hex.replace('0x', '')
    }
    hex = hex.replace(/^0+/, '')
    return '0x' + hex
  }
}
