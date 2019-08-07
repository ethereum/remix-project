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
      difficulty: '69762765929000',
      extraData: '0x0',
      gasLimit: 8000000,
      gasUsed: 0,
      hash: block.hash.toString('hex'),
      logsBloom: '0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331',
      miner: '0x0000000000000000000000000000000000000001',
      nonce: '0x0000000000000000',
      number: 1,
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
      size: 163591,
      stateRoot: '0xa633ca0e8f0ae4e86d4d572b048ea93d84eb4b11e2c988b48cb3a5f6f10b3c68',
      timestamp: block.timestamp,
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
