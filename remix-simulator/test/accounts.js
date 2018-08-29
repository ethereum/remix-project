/* global describe, before, it */
var Web3 = require('web3')
var RemixSim = require('../index.js')
let web3 = new Web3()
var assert = require('assert')

describe('Accounts', function () {
  before(function () {
    let provider = new RemixSim.Provider()
    web3.setProvider(provider)
  })

  it('should get a list of accounts', async function () {
    let accounts = await web3.eth.getAccounts()
    assert.notEqual(accounts.length, 0)
  })
})
