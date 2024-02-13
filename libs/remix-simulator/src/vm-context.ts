/* global ethereum */
'use strict'
import { Cache } from '@ethereumjs/statemanager/dist/cache'
import { hash } from '@remix-project/remix-lib'
import { bufferToHex, Account, toBuffer, bufferToBigInt} from '@ethereumjs/util'
import { keccak256 } from 'ethereum-cryptography/keccak'
import type { Address } from '@ethereumjs/util'
import { decode } from 'rlp'
import { ethers } from 'ethers'
import { execution } from '@remix-project/remix-lib'
const { LogsManager } = execution
import { VmProxy } from './VmProxy'
import { VM } from '@ethereumjs/vm'
import type { BigIntLike } from '@ethereumjs/util'
import { Common, ConsensusType } from '@ethereumjs/common'
import { Trie } from '@ethereumjs/trie'
import { DefaultStateManager, StateManager, EthersStateManager, EthersStateManagerOpts } from '@ethereumjs/statemanager'
import { StorageDump } from '@ethereumjs/statemanager/dist/interface'
import { EVM } from '@ethereumjs/evm'
import { EEI } from '@ethereumjs/vm'
import { Blockchain } from '@ethereumjs/blockchain'
import { Block } from '@ethereumjs/block'
import { Transaction } from '@ethereumjs/tx'
import { bigIntToHex } from '@ethereumjs/util'

/**
 * Options for constructing a {@link StateManager}.
 */
export interface DefaultStateManagerOpts {
  /**
   * A {@link Trie} instance
   */
  trie?: Trie
  /**
   * Option to prefix codehashes in the database. This defaults to `true`.
   * If this is disabled, note that it is possible to corrupt the trie, by deploying code
   * which code is equal to the preimage of a trie-node.
   * E.g. by putting the code `0x80` into the empty trie, will lead to a corrupted trie.
   */
  prefixCodeHashes?: boolean
}

/*
  extend vm state manager and instantiate VM
*/
class StateManagerCommonStorageDump extends DefaultStateManager {
  keyHashes: { [key: string]: string }
  constructor (opts: DefaultStateManagerOpts = {}) {
    super(opts)
    this.keyHashes = {}
  }

  putContractStorage (address, key, value) {
    this.keyHashes[hash.keccak(key).toString('hex')] = bufferToHex(key)
    return super.putContractStorage(address, key, value)
  }

  copy(): StateManagerCommonStorageDump {
    const copyState =  new StateManagerCommonStorageDump({
      trie: this._trie.copy(false),
    })
    copyState.keyHashes = this.keyHashes
    return copyState
  }

  async dumpStorage (address): Promise<StorageDump> {
    return new Promise((resolve, reject) => {
      this._getStorageTrie(address)
        .then((trie) => {
          const storage = {}
          const stream = trie.createReadStream()

          stream.on('data', (val) => {
            const value: any = decode(val.value)
            storage['0x' + val.key.toString('hex')] = {
              key: this.keyHashes[val.key.toString('hex')],
              value: '0x' + value.toString('hex')
            }
          })
          stream.on('end', () => {
            resolve(storage)
          })
        })
        .catch((e) => {
          reject(e)
        })
    })
  }
}

export interface CustomEthersStateManagerOpts {
  provider: string | ethers.providers.StaticJsonRpcProvider | ethers.providers.JsonRpcProvider
  blockTag: string,
  /**
   * A {@link Trie} instance
   */
  trie?: Trie
}

class CustomEthersStateManager extends StateManagerCommonStorageDump {
  private provider: ethers.providers.StaticJsonRpcProvider | ethers.providers.JsonRpcProvider
  private blockTag: string

  constructor(opts: CustomEthersStateManagerOpts) {
    super(opts)
    if (typeof opts.provider === 'string') {
      this.provider = new ethers.providers.StaticJsonRpcProvider(opts.provider)
    } else if (opts.provider instanceof ethers.providers.JsonRpcProvider) {
      this.provider = opts.provider
    } else {
      throw new Error(`valid JsonRpcProvider or url required; got ${opts.provider}`)
    }

    this.blockTag = opts.blockTag

    /*
     * For a custom StateManager implementation adopt these
     * callbacks passed to the `Cache` instantiated to perform
     * the `get`, `put` and `delete` operations with the
     * desired backend.
     */
    const getCb = async (address) => {
      const rlp = await this._trie.get(address.buf)
      if (rlp) {
        const ac = Account.fromRlpSerializedAccount(rlp)
        return ac
      } else {
        const ac =  await this.getAccountFromProvider(address)
        return ac
      }
    }
    const putCb = async (keyBuf, accountRlp) => {
      const trie = this._trie
      await trie.put(keyBuf, accountRlp)
    }
    const deleteCb = async (keyBuf: Buffer) => {
      const trie = this._trie
      await trie.del(keyBuf)
    }
    this._cache = new Cache({ getCb, putCb, deleteCb })
  }

  /**
   * Sets the new block tag used when querying the provider and clears the
   * internal cache.
   * @param blockTag - the new block tag to use when querying the provider
   */
  setBlockTag(blockTag: bigint | 'earliest'): void {
    this.blockTag = blockTag === 'earliest' ? blockTag : bigIntToHex(blockTag)
  }

  copy(): CustomEthersStateManager {
    const newState = new CustomEthersStateManager({
      provider: this.provider,
      blockTag: this.blockTag,
      trie: this._trie.copy(false),
    })
    return newState
  }

  /**
   * Gets the code corresponding to the provided `address`.
   * @param address - Address to get the `code` for
   * @returns {Promise<Buffer>} - Resolves with the code corresponding to the provided address.
   * Returns an empty `Buffer` if the account has no associated code.
   */
  async getContractCode(address: Address): Promise<Buffer> {
    const code = await super.getContractCode(address)
    if (code && code.length > 0) return code
    else {
      const code = toBuffer(await this.provider.getCode(address.toString(), this.blockTag))
      await super.putContractCode(address, code)
      return code
    }
  }

  /**
   * Gets the storage value associated with the provided `address` and `key`. This method returns
   * the shortest representation of the stored value.
   * @param address -  Address of the account to get the storage for
   * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
   * @returns {Promise<Buffer>} - The storage value for the account
   * corresponding to the provided address at the provided key.
   * If this does not exist an empty `Buffer` is returned.
   */
  async getContractStorage(address: Address, key: Buffer): Promise<Buffer> {
    let storage = await super.getContractStorage(address, key)
    if (storage && storage.length > 0) return storage
    else {
      storage = toBuffer(await this.provider.getStorageAt(
        address.toString(),
        bufferToBigInt(key),
        this.blockTag)
      )
      await super.putContractStorage(address, key, storage)
      return storage
    }
  }

  /**
   * Checks if an `account` exists at `address`
   * @param address - Address of the `account` to check
   */
  async accountExists(address: Address): Promise<boolean> {
    const localAccount = this._cache.get(address)
    if (!localAccount.isEmpty()) return true
    // Get merkle proof for `address` from provider
    const proof = await this.provider.send('eth_getProof', [address.toString(), [], this.blockTag])

    const proofBuf = proof.accountProof.map((proofNode: string) => toBuffer(proofNode))

    const trie = new Trie({ useKeyHashing: true })
    const verified = await trie.verifyProof(
      Buffer.from(keccak256(proofBuf[0])),
      address.buf,
      proofBuf
    )
    // if not verified (i.e. verifyProof returns null), account does not exist
    return verified === null ? false : true
  }

  /**
   * Retrieves an account from the provider and stores in the local trie
   * @param address Address of account to be retrieved from provider
   * @private
   */
  async getAccountFromProvider(address: Address): Promise<Account> {
    let accountData
    try {
      accountData = await this.provider.send('eth_getProof', [
        address.toString(),
        [],
        this.blockTag,
      ])
    } catch (e) {
      console.log(e)
    }
    let account
    if (!accountData) {
      account = Account.fromAccountData({
        balance: BigInt(0),
        nonce: BigInt(0),
        codeHash: toBuffer('0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470')
      })
    } else {
      const codeHash = accountData.codeHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ? '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' : accountData.codeHash
      account = Account.fromAccountData({
        balance: BigInt(accountData.balance),
        nonce: BigInt(accountData.nonce),
        codeHash: toBuffer(codeHash)
        // storageRoot: toBuffer([]), // we have to remove this in order to force the creation of the Trie in the local state.
      })
    }    
    return account
  }
}

export type CurrentVm = {
  vm: VM,
  web3vm: VmProxy,
  stateManager: StateManager,
  common: Common
}

export class VMCommon extends Common {

  /**
   * Override "setHardforkByBlockNumber" to disable updating the original fork state
   * 
   * @param blockNumber
   * @param td
   * @param timestamp
   * @returns The name of the HF set
   */
  setHardforkByBlockNumber(
    blockNumber: BigIntLike,
    td?: BigIntLike,
    timestamp?: BigIntLike
  ): string {
    return this.hardfork()
  }
}

/*
  trigger contextChanged, web3EndpointChanged
*/
export class VMContext {
  currentFork: string
  blockGasLimitDefault: number
  blockGasLimit: number
  blocks: Record<string, Block>
  latestBlockNumber: string
  blockByTxHash: Record<string, Block>
  txByHash: Record<string, Transaction>
  currentVm: CurrentVm
  web3vm: VmProxy
  logsManager: any // LogsManager 
  exeResults: Record<string, Transaction>
  nodeUrl: string
  blockNumber: number | 'latest'

  constructor (fork?: string, nodeUrl?: string, blockNumber?: number | 'latest') {
    this.blockGasLimitDefault = 4300000
    this.blockGasLimit = this.blockGasLimitDefault
    this.currentFork = fork || 'merge'
    this.nodeUrl = nodeUrl
    this.blockNumber = blockNumber
    this.blocks = {}
    this.latestBlockNumber = "0x0"
    this.blockByTxHash = {}
    this.txByHash = {}
    this.exeResults = {}
    this.logsManager = new LogsManager()
  }

  async init () {
    this.currentVm = await this.createVm(this.currentFork)
  }

  async createVm (hardfork) {
    let stateManager: StateManager
    if (this.nodeUrl) {
      let block = this.blockNumber
      if (this.blockNumber === 'latest') {
        const provider = new ethers.providers.StaticJsonRpcProvider(this.nodeUrl)
        block = await provider.getBlockNumber()
        stateManager = new CustomEthersStateManager({
          provider: this.nodeUrl,
          blockTag: '0x' + block.toString(16)
        })
        this.blockNumber = block
      } else {
        stateManager = new CustomEthersStateManager({
          provider: this.nodeUrl,
          blockTag: '0x' + this.blockNumber.toString(16)
        })
      }
      
    } else
      stateManager = new StateManagerCommonStorageDump()

    const consensusType = hardfork === 'berlin' || hardfork === 'london' ? ConsensusType.ProofOfWork : ConsensusType.ProofOfStake
    const difficulty = consensusType === ConsensusType.ProofOfStake ? 0 : 69762765929000

    const common = new VMCommon({ chain: 'mainnet', hardfork })
    const genesisBlock: Block = Block.fromBlockData({
      header: {
        timestamp: (new Date().getTime() / 1000 | 0),
        number: 0,
        coinbase: '0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a',
        difficulty,
        gasLimit: 8000000
      }
    }, { common, hardforkByBlockNumber: false, hardforkByTTD: undefined })

    const blockchain = await Blockchain.create({ common, validateBlocks: false, validateConsensus: false, genesisBlock })
    const eei = new EEI(stateManager, common, blockchain)
    const evm = new EVM({ common, eei, allowUnlimitedContractSize: true })
    
    const vm = await VM.create({
      common,
      activatePrecompiles: true,
      hardforkByBlockNumber: false,
      stateManager,
      blockchain,
      evm
    })

    // VmProxy and VMContext are very intricated.
    // VmProxy is used to track the EVM execution (to listen on opcode execution, in order for instance to generate the VM trace)
    const web3vm = new VmProxy(this)
    web3vm.setVM(vm)
    this.addBlock(genesisBlock, true)
    return { vm, web3vm, stateManager, common }
  }

  getCurrentFork () {
    return this.currentFork
  }

  web3 () {
    return this.currentVm.web3vm
  }

  vm () {
    return this.currentVm.vm
  }

  vmObject () {
    return this.currentVm
  }

  addBlock (block: Block, genesis?: boolean, isCall?: boolean) {
    let blockNumber = bigIntToHex(block.header.number)
    if (blockNumber === '0x') {
      blockNumber = '0x0'
    }

    this.blocks['0x' + block.hash().toString('hex')] = block
    this.blocks[blockNumber] = block
    this.latestBlockNumber = blockNumber

    if (!isCall && !genesis) this.logsManager.checkBlock(blockNumber, block, this.web3())
  }

  trackTx (txHash, block, tx) {
    this.blockByTxHash[txHash] = block
    this.txByHash[txHash] = tx
  }

  trackExecResult (tx, execReult) {
    this.exeResults[tx] = execReult
  }
}
