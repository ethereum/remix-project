var EthJSBlock = require('ethereumjs-block')
var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext
var ethJSUtil = require('ethereumjs-util')
var BN = ethJSUtil.BN

function checkpointAndCommit (cb) {
  if (executionContext.vm().stateManager._checkpointCount > 0) {
    return executionContext.vm().stateManager.commit(() => {
      cb()
    })
  }
  executionContext.vm().stateManager.checkpoint(() => {
    executionContext.vm().stateManager.commit(() => {
      cb()
    })
  })
}

function generateBlock () {
  var block = new EthJSBlock({
    header: {
      timestamp: (new Date().getTime() / 1000 | 0),
      number: 1,
      coinbase: '0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a',
      difficulty: (new BN('69762765929000', 10)),
      gasLimit: new BN('5000000').imuln(1)
    },
    transactions: [],
    uncleHeaders: []
  })

  checkpointAndCommit(() => {
    executionContext.vm().runBlock({ block: block, generate: true, skipBlockValidation: true, skipBalance: false }, function () {
      executionContext.addBlock(block)
    })
  })
}

module.exports = generateBlock