const Web3 = require('web3')
const { BN, privateToAddress, toChecksumAddress, isValidPrivate, stripHexPrefix } = require('ethereumjs-util')
const crypto = require('crypto')
const ethJSUtil = require('ethereumjs-util')
const RemixSimulator = require('remix-simulator')

class VMProvider {

  constructor (executionContext) {
    this.executionContext = executionContext
    this.RemixSimulatorProvider = new RemixSimulator.Provider({executionContext: this.executionContext})
    this.RemixSimulatorProvider.init()
    this.web3 = new Web3(this.RemixSimulatorProvider)
    this.accounts = {}
  }

  getAccounts (cb) {
    this.web3.eth.getAccounts((err, accounts) => {
      console.dir(err)
      console.dir(accounts)
      if (err) {
        return cb('No accounts?')
      }
      return cb(null, accounts)
    })
    // if (!this.accounts) {
    //   cb('No accounts?')
    //   return cb('No accounts?')
    // }
    // return cb(null, Object.keys(this.accounts))
  }

  resetEnvironment () {
    this.accounts = {}
    this._addAccount('3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511', '0x56BC75E2D63100000')
    this._addAccount('2ac6c190b09897cd8987869cc7b918cfea07ee82038d492abce033c75c1b1d0c', '0x56BC75E2D63100000')
    this._addAccount('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', '0x56BC75E2D63100000')
    this._addAccount('d74aa6d18aa79a05f3473dd030a97d3305737cbc8337d940344345c1f6b72eea', '0x56BC75E2D63100000')
    this._addAccount('71975fbf7fe448e004ac7ae54cad0a383c3906055a65468714156a07385e96ce', '0x56BC75E2D63100000')
  }

  /** Add an account to the list of account (only for Javascript VM) */
  _addAccount (privateKey, balance) {
    this.RemixSimulatorProvider.Accounts._addAccount(privateKey, balance)
    // privateKey = Buffer.from(privateKey, 'hex')
    // const address = privateToAddress(privateKey)
// 
    // FIXME: we don't care about the callback, but we should still make this proper
    // let stateManager = this.executionContext.vm().stateManager
    // stateManager.getAccount(address, (error, account) => {
      // if (error) return console.log(error)
      // account.balance = balance || '0xf00000000000000001'
      // stateManager.putAccount(address, account, (error) => {
        // if (error) console.log(error)
      // })
    // })
// 
    // this.accounts[toChecksumAddress('0x' + address.toString('hex'))] = { privateKey, nonce: 0 }
  }

  createVMAccount (newAccount) {
    const { privateKey, balance } = newAccount
    this._addAccount(privateKey, balance)
    const privKey = Buffer.from(privateKey, 'hex')
    return '0x' + privateToAddress(privKey).toString('hex')
  }

  newAccount (_passwordPromptCb, cb) {
    let privateKey
    do {
      privateKey = crypto.randomBytes(32)
    } while (!isValidPrivate(privateKey))
    this._addAccount(privateKey, '0x56BC75E2D63100000')
    return cb(null, '0x' + privateToAddress(privateKey).toString('hex'))
  }

  getBalanceInEther (address, cb) {
    address = stripHexPrefix(address)

    this.executionContext.vm().stateManager.getAccount(Buffer.from(address, 'hex'), (err, res) => {
      if (err) {
        return cb('Account not found')
      }
      cb(null, Web3.utils.fromWei(new BN(res.balance).toString(10), 'ether'))
    })
  }

  getGasPrice (cb) {
    this.executionContext.web3().eth.getGasPrice(cb)
  }

  signMessage (message, account, _passphrase, cb) {
    const personalMsg = ethJSUtil.hashPersonalMessage(Buffer.from(message))
    // const privKey = this.providers.vm.accounts[account].privateKey
    const privKey = this.RemixSimulatorProvider.Accounts.accounts[account].privateKey
    try {
      const rsv = ethJSUtil.ecsign(personalMsg, privKey)
      const signedData = ethJSUtil.toRpcSig(rsv.v, rsv.r, rsv.s)
      cb(null, '0x' + personalMsg.toString('hex'), signedData)
    } catch (e) {
      cb(e.message)
    }
  }

  getProvider () {
    return 'vm'
  }
}

module.exports = VMProvider
