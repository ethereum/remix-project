const name = 'String Length: '
const desc = 'Bytes length != String length'
const categories = require('./categories')
const common = require('./staticAnalysisCommon')

function stringBytesLength () {
  this.stringToBytesConversions = []
  this.bytesLengthChecks = []
}

stringBytesLength.prototype.visit = function (node) {
  if (common.isStringToBytesConversion(node)) this.stringToBytesConversions.push(node)
  else if (common.isBytesLengthCheck(node)) this.bytesLengthChecks.push(node)
}

stringBytesLength.prototype.report = function (compilationResults) {
  if (this.stringToBytesConversions.length > 0 && this.bytesLengthChecks.length > 0) {
    return [{
      warning: 'Bytes and string length are not the same since strings are assumed to be UTF-8 encoded (according to the ABI defintion) therefore one character is not nessesarily encoded in one byte of data.',
      location: this.bytesLengthChecks[0].src,
      more: 'https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI#argument-encoding'
    }]
  } else {
    return []
  }
}

module.exports = {
  name: name,
  description: desc,
  category: categories.MISC,
  Module: stringBytesLength
}
