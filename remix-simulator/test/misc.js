/* global describe, before, it */
var Web3 = require('web3')
var RemixSim = require('../index.js')
let web3 = new Web3()
var assert = require('assert')

describe('Misc', function () {
  before(function () {
    let provider = new RemixSim.Provider()
    web3.setProvider(provider)
  })

  it('should get correct remix simulator version', async function (done) {
    web3._requestManager.send({method: 'web3_clientVersion', params: []}, (err, version) => {
      if (err) {
        throw new Error(err)
      }
      let remixVersion = require('../package.json').version
      assert.equal(version, 'Remix Simulator/' + remixVersion)
      done()
    })
  })

  it('should get protocol version', async function () {
    web3._requestManager.send({method: 'eth_protocolVersion', params: []}, (err, result) => {
      if (err) {
        throw new Error(err)
      }
      assert.equal(result, '0x3f')
    })
  })

  it('should get if is syncing', async function () {
    let isSyncing = await web3.eth.isSyncing()
    assert.equal(isSyncing, false)
  })

  it('should get if is mining', async function () {
    let isMining = await web3.eth.isMining()
    assert.equal(isMining, false)
  })

  it('should get hashrate', async function () {
    let hashrate = await web3.eth.getHashrate()
    assert.equal(hashrate, 0)
  })

  it('should get result of a sha3', async function () {
    web3._requestManager.send({method: 'web3_sha3', params: ['0x68656c6c6f20776f726c64']}, (err, result) => {
      if (err) {
        throw new Error(err)
      }
      assert.equal(result, '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad')
    })
  })
})
