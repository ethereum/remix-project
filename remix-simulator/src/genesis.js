var EthJSBlock = require('ethereumjs-block')
var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN

function generateBlock () {
  var block = new EthJSBlock({
    header: {
      timestamp: (new Date().getTime() / 1000 | 0),
      number: 0,
      coinbase: '0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a',
      difficulty: (new BN('69762765929000', 10)),
      gasLimit: new BN('8000000').imuln(1)
    },
    transactions: [],
    uncleHeaders: []
  })

  executionContext.vm().runBlock({ block: block, generate: true, skipBlockValidation: true, skipBalance: false }).then(function () {
    executionContext.addBlock(block)
  })
}

module.exports = generateBlock
