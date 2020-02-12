import { default as category } from './categories'
import { isStringToBytesConversion, isBytesLengthCheck } from './staticAnalysisCommon'

export default class stringBytesLength {
  name = 'String Length: '
  desc = 'Bytes length != String length'
  categories = category.MISC

  stringToBytesConversions: any[] = []
  bytesLengthChecks: any[] = []


  visit (node) {
    if (isStringToBytesConversion(node)) this.stringToBytesConversions.push(node)
    else if (isBytesLengthCheck(node)) this.bytesLengthChecks.push(node)
  }

  report (compilationResults) {
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
}
