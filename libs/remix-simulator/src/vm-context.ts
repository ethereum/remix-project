/* global ethereum */
'use strict'
import { hash } from '@remix-project/remix-lib'
import { bytesToHex, Account, bigIntToHex, MapDB, toBytes, bytesToBigInt, BIGINT_0 } from '@ethereumjs/util'
import { keccak256 } from 'ethereum-cryptography/keccak'
import { Address } from '@ethereumjs/util'
import { decode } from 'rlp'
import { ethers } from 'ethers'
import { execution } from '@remix-project/remix-lib'
const { LogsManager } = execution
import { VmProxy } from './VmProxy'
import { VM } from '@ethereumjs/vm'
import { Common, ConsensusType } from '@ethereumjs/common'
import { Trie } from '@ethereumjs/trie'
import { DefaultStateManager } from '@ethereumjs/statemanager'
import { EVMStateManagerInterface, StorageDump } from '@ethereumjs/common'
import { EVM } from '@ethereumjs/evm'
import { Blockchain } from '@ethereumjs/blockchain'
import { Block } from '@ethereumjs/block'
import { TypedTransaction } from '@ethereumjs/tx'
import { State } from './provider'
import { hexToBytes } from 'web3-utils'

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

  getDb () {
    // @ts-ignore
    return this._trie.database().db
  }

  putContractStorage (address, key, value) {
    this.keyHashes[bytesToHex(hash.keccak(key))] = bytesToHex(key)
    return super.putContractStorage(address, key, value)
  }

  shallowCopy(): StateManagerCommonStorageDump {
    const copyState = new StateManagerCommonStorageDump({
      trie: this._trie.shallowCopy(false),
    })
    copyState.keyHashes = this.keyHashes
    return copyState
  }

  async dumpStorage (address): Promise<StorageDump> {
    await this.flush()
    const account = await this.getAccount(address)
    if (!account) {
      throw new Error(`dumpStorage f() can only be called for an existing account`)
    }
    return new Promise((resolve, reject) => {
      try {
        const trie = this._getStorageTrie(address, account)
        const storage = {}
        const stream = trie.createReadStream()

        stream.on('data', (val) => {
          const value: any = decode(val.value)
          storage[bytesToHex(val.key)] = {
            key: this.keyHashes[bytesToHex(val.key)],
            value: bytesToHex(value)
          }
        })
        stream.on('end', () => {
          resolve(storage)
        })
        stream.on('error', (e) => {
          reject(e)
        })
      } catch (e) {
        reject(e)
      }
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
  }

  /**
   * Sets the new block tag used when querying the provider and clears the
   * internal cache.
   * @param blockTag - the new block tag to use when querying the provider
   */
  setBlockTag(blockTag: bigint | 'earliest'): void {
    this.blockTag = blockTag === 'earliest' ? blockTag : bigIntToHex(blockTag)
  }

  shallowCopy(): CustomEthersStateManager {
    const newState = new CustomEthersStateManager({
      provider: this.provider,
      blockTag: this.blockTag,
      trie: this._trie.shallowCopy(false),
    })
    return newState
  }

  /**
   * Gets the code corresponding to the provided `address`.
   * @param address - Address to get the `code` for
   * @returns {Promise<Buffer>} - Resolves with the code corresponding to the provided address.
   * Returns an empty `Buffer` if the account has no associated code.
   */
  async getContractCode(address: Address): Promise<Uint8Array> {
    const code = await super.getContractCode(address)
    if (code && code.length > 0) return code
    else {
      const code = toBytes(await this.provider.getCode(address.toString(), this.blockTag))
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
  async getContractStorage(address: Address, key: Buffer): Promise<Uint8Array> {
    let storage = await super.getContractStorage(address, key)
    if (storage && storage.length > 0) return storage
    else {
      storage = toBytes(await this.provider.getStorageAt(
        address.toString(),
        bytesToBigInt(key),
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
    const account = await super.getAccount(address)
    if (!account.isEmpty()) return true

    // Get merkle proof for `address` from provider
    const proof = await this.provider.send('eth_getProof', [address.toString(), [], this.blockTag])

    const proofBuf = proof.accountProof.map((proofNode: string) => toBytes(proofNode))

    const trie = new Trie({ useKeyHashing: true })
    const verified = await trie.verifyProof(
      Buffer.from(keccak256(proofBuf[0])),
      address.bytes,
      proofBuf
    )
    if (verified) {
      const codeHash = proof.codeHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ? '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' : proof.codeHash
      const account = Account.fromAccountData({
        balance: BigInt(proof.balance),
        nonce: BigInt(proof.nonce),
        codeHash: hexToBytes(codeHash)
        // storageRoot: toBuffer([]), // we have to remove this in order to force the creation of the Trie in the local state.
      })
      super.putAccount(address, account)
    }
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
        codeHash: hexToBytes('0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470')
      })
    } else {
      const codeHash = accountData.codeHash === '0x0000000000000000000000000000000000000000000000000000000000000000' ? '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' : accountData.codeHash
      account = Account.fromAccountData({
        balance: BigInt(accountData.balance),
        nonce: BigInt(accountData.nonce),
        codeHash: hexToBytes(codeHash)
        // storageRoot: toBuffer([]), // we have to remove this in order to force the creation of the Trie in the local state.
      })
    }
    return account
  }
}

export type CurrentVm = {
  vm: VM,
  web3vm: VmProxy,
  stateManager: EVMStateManagerInterface,
  common: Common
}

export class VMCommon extends Common {

  /**
    * Always return the fork set at initialization
    */
  setHardforkBy() {
    return this._hardfork;
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
  txByHash: Record<string, TypedTransaction>
  currentVm: CurrentVm
  web3vm: VmProxy
  logsManager: any // LogsManager
  exeResults: Record<string, TypedTransaction>
  nodeUrl: string
  blockNumber: number | 'latest'
  stateDb: State
  rawBlocks: string[]
  serializedBlocks: Uint8Array[]

  constructor (fork?: string, nodeUrl?: string, blockNumber?: number | 'latest', stateDb?: State, blocksData?: string[]) {
    this.blockGasLimitDefault = 4300000
    this.blockGasLimit = this.blockGasLimitDefault
    this.currentFork = fork || 'cancun'
    this.nodeUrl = nodeUrl
    this.stateDb = stateDb
    this.blockNumber = blockNumber
    this.blocks = {}
    this.latestBlockNumber = "0x0"
    this.blockByTxHash = {}
    this.txByHash = {}
    this.exeResults = {}
    this.logsManager = new LogsManager()
    this.rawBlocks = blocksData
    this.serializedBlocks = []
  }

  async init () {
    this.currentVm = await this.createVm(this.currentFork)
  }

  async createVm (hardfork) {
    let stateManager: EVMStateManagerInterface
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
          blockTag: '0x' + block.toString(16)
        })
      }
    } else {
      const db = this.stateDb ? new Map(Object.entries(this.stateDb).map(([k, v]) => [k, hexToBytes(v)])) : new Map()
      const mapDb = new MapDB(db)
      const trie = await Trie.create({ useKeyHashing: true, db: mapDb, useRootPersistence: true })

      stateManager = new StateManagerCommonStorageDump({ trie })
    }

    const consensusType = hardfork === 'berlin' || hardfork === 'london' ? ConsensusType.ProofOfWork : ConsensusType.ProofOfStake
    const difficulty = consensusType === ConsensusType.ProofOfStake ? 0 : 69762765929000

    const common = new VMCommon({ chain: 'mainnet', hardfork })
    const blocks = (this.rawBlocks || []).map(block => {
      const serializedBlock = hexToBytes(block)
      this.serializedBlocks.push(serializedBlock)
      return Block.fromRLPSerializedBlock(serializedBlock, { common })
    })
    const genesisBlock: Block = blocks.length > 0 && (blocks[0] || {}).isGenesis ? blocks[0] : Block.fromBlockData({
      header: {
        timestamp: (new Date().getTime() / 1000 | 0),
        number: BIGINT_0,
        coinbase: '0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a',
        difficulty,
        gasLimit: 8000000
      }
    }, { common })

    const blockchain = await Blockchain.create({ common, validateBlocks: false, validateConsensus: false, genesisBlock })
    const evm = await EVM.create({ common, allowUnlimitedContractSize: true, stateManager, blockchain })

    const vm = await VM.create({
      common,
      activatePrecompiles: true,
      stateManager,
      blockchain,
      evm
    })
    // VmProxy and VMContext are very intricated.
    // VmProxy is used to track the EVM execution (to listen on opcode execution, in order for instance to generate the VM trace)
    const web3vm = new VmProxy(this)
    web3vm.setVM(vm)
    this.addBlock(genesisBlock, true)
    if (blocks.length > 0) blocks.splice(0, 1)
    for (const block of blocks) {
      await blockchain.putBlock(block)
      this.addBlock(block, false, false, web3vm)
    }
    return { vm, web3vm, stateManager, common, blocks }
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

  addBlock (block: Block, genesis?: boolean, isCall?: boolean, web3vm?: VmProxy) {
    let blockNumber = bigIntToHex(block.header.number)
    if (blockNumber === '0x') {
      blockNumber = '0x0'
    }

    this.blocks[bytesToHex(block.hash())] = block
    this.blocks[blockNumber] = block
    this.latestBlockNumber = blockNumber

    if (!isCall && !genesis && web3vm) this.logsManager.checkBlock(blockNumber, block, web3vm)
    if (!isCall && !genesis && !web3vm) this.logsManager.checkBlock(blockNumber, block, this.web3())
  }

  trackTx (txHash, block, tx) {
    this.blockByTxHash[txHash] = block
    this.txByHash[txHash] = tx
  }

  trackExecResult (tx, execReult) {
    this.exeResults[tx] = execReult
  }
}
