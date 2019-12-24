
var Blocks = function (executionContext, _options) {
  this.executionContext = executionContext
  const options = _options || {}
  this.coinbase = options.coinbase || '0x0000000000000000000000000000000000000000'
  this.blockNumber = 0
}

Blocks.prototype.methods = function () {
  return {
    eth_getBlockByNumber: this.eth_getBlockByNumber.bind(this),
    eth_gasPrice: this.eth_gasPrice.bind(this),
    eth_coinbase: this.eth_coinbase.bind(this),
    eth_blockNumber: this.eth_blockNumber.bind(this),
    eth_getBlockByHash: this.eth_getBlockByHash.bind(this),
    eth_getBlockTransactionCountByHash: this.eth_getBlockTransactionCountByHash.bind(this),
    eth_getBlockTransactionCountByNumber: this.eth_getBlockTransactionCountByNumber.bind(this),
    eth_getUncleCountByBlockHash: this.eth_getUncleCountByBlockHash.bind(this),
    eth_getUncleCountByBlockNumber: this.eth_getUncleCountByBlockNumber.bind(this),
    eth_getStorageAt: this.eth_getStorageAt.bind(this)
  }
}

Blocks.prototype.eth_getBlockByNumber = function (payload, cb) {
  let blockIndex = payload.params[0]
  if (blockIndex === 'latest') {
    blockIndex = this.executionContext.latestBlockNumber
  }

  const block = this.executionContext.blocks[blockIndex]

  if (!block) {
    return cb(new Error('block not found'))
  }

  let b = {
    'number': toHex(block.header.number),
    'hash': toHex(block.hash()),
    'parentHash': toHex(block.header.parentHash),
    'nonce': toHex(block.header.nonce),
    'sha3Uncles': '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    'logsBloom': '0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331',
    'transactionsRoot': '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
    'stateRoot': toHex(block.header.stateRoot),
    'miner': this.coinbase,
    'difficulty': toHex(block.header.difficulty),
    'totalDifficulty': toHex(block.header.totalDifficulty),
    'extraData': toHex(block.header.extraData),
    'size': '0x027f07', // 163591
    'gasLimit': toHex(block.header.gasLimit),
    'gasUsed': toHex(block.header.gasUsed),
    'timestamp': toHex(block.header.timestamp),
    'transactions': block.transactions.map((t) => '0x' + t.hash().toString('hex')),
    'uncles': []
  }

  cb(null, b)
}

function toHex (value) {
  if (!value) return '0x0'
  let v = value.toString('hex')
  return ((v === '0x' || v === '') ? '0x0' : ('0x' + v))
}

Blocks.prototype.eth_getBlockByHash = function (payload, cb) {
  var block = this.executionContext.blocks[payload.params[0]]

  let b = {
    'number': toHex(block.header.number),
    'hash': toHex(block.hash()),
    'parentHash': toHex(block.header.parentHash),
    'nonce': toHex(block.header.nonce),
    'sha3Uncles': '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
    'logsBloom': '0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331',
    'transactionsRoot': '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
    'stateRoot': toHex(block.header.stateRoot),
    'miner': this.coinbase,
    'difficulty': toHex(block.header.difficulty),
    'totalDifficulty': toHex(block.header.totalDifficulty),
    'extraData': toHex(block.header.extraData),
    'size': '0x027f07', // 163591
    'gasLimit': toHex(block.header.gasLimit),
    'gasUsed': toHex(block.header.gasUsed),
    'timestamp': toHex(block.header.timestamp),
    'transactions': block.transactions.map((t) => '0x' + t.hash().toString('hex')),
    'uncles': []
  }

  cb(null, b)
}

Blocks.prototype.eth_gasPrice = function (payload, cb) {
  cb(null, 1)
}

Blocks.prototype.eth_coinbase = function (payload, cb) {
  cb(null, this.coinbase)
}

Blocks.prototype.eth_blockNumber = function (payload, cb) {
  cb(null, this.blockNumber)
}

Blocks.prototype.eth_getBlockTransactionCountByHash = function (payload, cb) {
  var block = this.executionContext.blocks[payload.params[0]]

  cb(null, block.transactions.length)
}

Blocks.prototype.eth_getBlockTransactionCountByNumber = function (payload, cb) {
  var block = this.executionContext.blocks[payload.params[0]]

  cb(null, block.transactions.length)
}

Blocks.prototype.eth_getUncleCountByBlockHash = function (payload, cb) {
  cb(null, 0)
}

Blocks.prototype.eth_getUncleCountByBlockNumber = function (payload, cb) {
  cb(null, 0)
}

Blocks.prototype.eth_getStorageAt = function (payload, cb) {
  const [address, position, blockNumber] = payload.params

  this.executionContext.web3().debug.storageRangeAt(blockNumber, 'latest', address.toLowerCase(), position, 1, (err, result) => {
    if (err || (result.storage && Object.values(result.storage).length === 0)) {
      return cb(err, '')
    }

    let value = Object.values(result.storage)[0].value
    cb(err, value)
  })
}

module.exports = Blocks
