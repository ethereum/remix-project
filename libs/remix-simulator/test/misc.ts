/* global describe, before, it */
import Web3 from 'web3'
import { Provider } from '../src/index'
const web3 = new Web3()
import * as assert from 'assert'

describe('Misc', () => {
  before(async () => {
    const provider = new Provider()
    await provider.init()
    web3.setProvider(provider as any)
  })

  describe('web3_clientVersion', () => {
    it('should get correct remix simulator version', async (done) => {
      web3['_requestManager'].send({ method: 'web3_clientVersion', params: [] }, (err, version) => {
        if (err) {
          throw new Error(err)
        }
        const remixVersion = require('../package.json').version
        assert.equal(version, 'Remix Simulator/' + remixVersion)
        done()
      })
    })
  })

  describe('eth_protocolVersion', () => {
    it('should get protocol version', async () => {
      web3['_requestManager'].send({ method: 'eth_protocolVersion', params: [] }, (err, result) => {
        if (err) {
          throw new Error(err)
        }
        assert.equal(result, '0x3f')
      })
    })
  })

  describe('eth_syncing', () => {
    it('should get if is syncing', async () => {
      const isSyncing = await web3.eth.isSyncing()
      assert.equal(isSyncing, false)
    })
  })

  describe('eth_mining', () => {
    it('should get if is mining', async () => {
      const isMining = await web3.eth.isMining()
      assert.equal(isMining, false)
    })
  })

  describe('eth_hashrate', () => {
    it('should get hashrate', async () => {
      const hashrate = await web3.eth.getHashrate()
      assert.equal(hashrate, 0)
    })
  })

  describe('web3_sha3', () => {
    it('should get result of a sha3', async () => {
      web3['_requestManager'].send({ method: 'web3_sha3', params: ['0x68656c6c6f20776f726c64'] }, (err, result) => {
        if (err) {
          throw new Error(err)
        }
        assert.equal(result, '0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad')
      })
    })
  })

  describe('eth_getCompilers', () => {
    it('should get list of compilers', async () => {
      web3['_requestManager'].send({ method: 'eth_getCompilers', params: [] }, (err, result) => {
        if (err) {
          throw new Error(err)
        }
        assert.equal(result, 0)
      })
    })
  })

  describe('eth_compileSolidity', () => {
    it('get unsupported result when requesting solidity compiler', async () => {
      web3['_requestManager'].send({ method: 'eth_compileSolidity', params: [] }, (err, result) => {
        if (err) {
          throw new Error(err)
        }
        assert.equal(result, 'unsupported')
      })
    })
  })

  describe('eth_compileLLL', () => {
    it('get unsupported result when requesting LLL compiler', async () => {
      web3['_requestManager'].send({ method: 'eth_compileLLL', params: [] }, (err, result) => {
        if (err) {
          throw new Error(err)
        }
        assert.equal(result, 'unsupported')
      })
    })
  })

  describe('eth_compileSerpent', () => {
    it('get unsupported result when requesting serpent compiler', async () => {
      web3['_requestManager'].send({ method: 'eth_compileSerpent', params: [] }, (err, result) => {
        if (err) {
          throw new Error(err)
        }
        assert.equal(result, 'unsupported')
      })
    })
  })
})
