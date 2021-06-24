/* global describe, before, it */
import Web3 from 'web3'
import { Provider } from '../src/index'
const web3 = new Web3()
import * as assert from 'assert'

describe('Accounts', () => {
  before(async function () {
    const provider = new Provider()
    await provider.init()
    web3.setProvider(provider as any)
  })

  describe('eth_getAccounts', () => {
    it('should get a list of accounts', async function () {
      const accounts: string[] = await web3.eth.getAccounts()
      assert.notEqual(accounts.length, 0)
    })
  })

  describe('eth_getBalance', () => {
    it('should get a account balance', async () => {
      const accounts: string[] = await web3.eth.getAccounts()
      const balance0: string = await web3.eth.getBalance(accounts[0])
      const balance1: string = await web3.eth.getBalance(accounts[1])
      const balance2: string = await web3.eth.getBalance(accounts[2])

      assert.deepEqual(balance0, '100000000000000000000')
      assert.deepEqual(balance1, '100000000000000000000')
      assert.deepEqual(balance2, '100000000000000000000')
    })
  })

  describe('eth_sign', () => {
    it('should sign payloads', async () => {
      const accounts: string[] = await web3.eth.getAccounts()
      const signature: string = await web3.eth.sign('Hello world', accounts[0])

      assert.deepEqual(signature.length, 132)
    })
  })
})
