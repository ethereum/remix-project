/* global describe, before, it */
import Web3 from 'web3'
import { Provider } from '../src/index'
const web3 = new Web3()
import * as assert from 'assert'

describe('Transactions', () => {
  before(async function () {
    const provider = new Provider({ fork: 'shanghai'})
    await provider.init()
    web3.setProvider(provider as any)
  })

  describe('eth_sendTransaction', () => {
    it('should deploy Storage contract, save a number and retrieve it', async function () {
      const accounts: string[] = await web3.eth.getAccounts()
      let receipt = await web3.eth.sendTransaction({
        from: accounts[0],
        gas: 1000000,
        data: '0x608060405234801561000f575f80fd5b506101438061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610034575f3560e01c80632e64cec1146100385780636057361d14610056575b5f80fd5b610040610072565b60405161004d919061009b565b60405180910390f35b610070600480360381019061006b91906100e2565b61007a565b005b5f8054905090565b805f8190555050565b5f819050919050565b61009581610083565b82525050565b5f6020820190506100ae5f83018461008c565b92915050565b5f80fd5b6100c181610083565b81146100cb575f80fd5b50565b5f813590506100dc816100b8565b92915050565b5f602082840312156100f7576100f66100b4565b5b5f610104848285016100ce565b9150509291505056fea2646970667358221220bfa7ddc6d937b635c7a8ad020080923800f04f6b0a685c47330306fd5267626b64736f6c63430008150033'
      })
      const storageAddress = receipt.contractAddress
      const receiptPull = await web3.eth.getTransactionReceipt(receipt.transactionHash)
      assert.equal(receiptPull.contractAddress, receipt.contractAddress)
      receipt = await web3.eth.sendTransaction({
        from: accounts[0],
        to: storageAddress,
        gas: 1000000,
        data: '0x6057361d000000000000000000000000000000000000000000000000000000000000000e'
      })
      const value = await web3.eth.call({
        from: accounts[0],
        to: storageAddress,
        data: '0x2e64cec1'
      })
      assert.notEqual(value, 15)
      assert.equal(value, 14)
    })
  })
})
