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

  describe('eth_getAccounts', () => {
    it('should get a list of accounts', async function () {
      let accounts = await web3.eth.getAccounts()
      assert.notEqual(accounts.length, 0)
    })
  })

  describe('eth_getBalance', () => {
    it('should get a account balance', async function () {
      let accounts = await web3.eth.getAccounts()
      let balance0 = await web3.eth.getBalance(accounts[0])
      let balance1 = await web3.eth.getBalance(accounts[1])
      let balance2 = await web3.eth.getBalance(accounts[2])

      assert.deepEqual(balance0, '100000000000000000000')
      assert.deepEqual(balance1, '100000000000000000000')
      assert.deepEqual(balance2, '100000000000000000000')
    })
  })

  describe('eth_sign', () => {
    it('should sign payloads', async function () {
      let accounts = await web3.eth.getAccounts()
      let signature = await web3.eth.sign('Hello world', accounts[0])

      assert.deepEqual(signature.length, 132)
    })
  })
})
