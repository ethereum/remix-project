/* global describe, before, it */
import Web3, { FMT_BYTES, FMT_NUMBER } from 'web3'
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
      const balance0: string = await web3.eth.getBalance(accounts[0], undefined, { number: FMT_NUMBER.STR, bytes: FMT_BYTES.HEX })
      const balance1: string = await web3.eth.getBalance(accounts[1], undefined, { number: FMT_NUMBER.STR, bytes: FMT_BYTES.HEX })
      const balance2: string = await web3.eth.getBalance(accounts[2], undefined, { number: FMT_NUMBER.STR, bytes: FMT_BYTES.HEX })

      assert.deepEqual(balance0, '100000000000000000000')
      assert.deepEqual(balance1, '100000000000000000000')
      assert.deepEqual(balance2, '100000000000000000000')
    })
  })

  describe('eth_sign', () => {
    it('should sign payloads', async () => {
      const accounts: string[] = await web3.eth.getAccounts()
      const signature = await web3.eth.sign(web3.utils.utf8ToHex('Hello world'), accounts[0])

      assert.deepEqual(typeof signature === 'string' ? signature.length : signature.signature.length, 132)
    })
  })

  describe('eth_signTypedData', () => {
    it('should sign typed data', async () => {
      const accounts: string[] = await web3.eth.getAccounts()
      const typedData = {
        domain: {
          chainId: 1,
          name: "Example App",
          verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
          version: "1",
        },
        message: {
          prompt: "Welcome! In order to authenticate to this website, sign this request and your public address will be sent to the server in a verifiable way.",
          createdAt: `${Date.now()}`,
        },
        primaryType: 'AuthRequest',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          AuthRequest: [
            { name: 'prompt', type: 'string' },
            { name: 'createdAt', type: 'uint256' },
          ],
        },
      };
      const result = await web3.currentProvider.sendAsync({
        method: 'eth_signTypedData',
        params: [accounts[0], typedData],
        id: 0,
        jsonrpc: '2.0'
      })
      console.log(result)
      assert.equal(result, '0xe4ee76332af49888d86a09eea70dfd5b9a7085e2e013cbba4c0cb41766eab69a6216f18b80d9277241ce35b74b6c46add36d5189eb5a94a258f076dfc4dd21161b')
    })
  })
})
