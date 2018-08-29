/* global describe, before, it */
var Web3 = require('web3')
var RemixSim = require('../index.js')
let web3 = new Web3()
var assert = require('assert')

describe('Whisper', function () {
  before(function () {
    let provider = new RemixSim.Provider()
    web3.setProvider(provider)
  })

  it('should get correct remix simulator version', async function () {
    let version = await web3.shh.getVersion()
    assert.equal(version, 5)
  })
})
