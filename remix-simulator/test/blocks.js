/* global describe, before, it */
var Web3 = require('web3')
var RemixSim = require('../index.js')
let web3 = new Web3()
var assert = require('assert')

describe('blocks', function () {
  before(function () {
    let provider = new RemixSim.Provider({
      coinbase: '0x0000000000000000000000000000000000000001'
    })
    web3.setProvider(provider)
  })

  it('should get block given its number', async function () {
    let block = await web3.eth.getBlock(1)

    let expectedBlock = {
      difficulty: '0',
      extraData: '0x',
      gasLimit: 8000000,
      gasUsed: 0,
      hash: '0xdb731f3622ef37b4da8db36903de029220dba74c41185f8429f916058b86559f',
      logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      miner: '0x0000000000000000000000000000000000000001',
      mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      nonce: '0x0000000000000042',
      number: 0,
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
      size: 504,
      stateRoot: '0xb7917653f92e62394d2207d0f39a1320ff1cb93d1cee80d3c492627e00b219ff',
      timestamp: 0,
      totalDifficulty: '0',
      transactions: [],
      transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      uncles: []
    }

    assert.deepEqual(block, expectedBlock)
  })

  it('should get gas price', async function () {
    let gasPrice = await web3.eth.getGasPrice()
    assert.equal(gasPrice, 1)
  })

  it('should get coinbase', async function () {
    let coinbase = await web3.eth.getCoinbase()
    assert.equal(coinbase, '0x0000000000000000000000000000000000000001')
  })
})
