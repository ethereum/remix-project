const Web3 = require('web3')
const { BN, privateToAddress, stripHexPrefix } = require('ethereumjs-util')
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
      if (err) {
        return cb('No accounts?')
      }
      return cb(null, accounts)
    })
  }

  resetEnvironment () {
    this.RemixSimulatorProvider.Accounts.resetAccounts()
    this.accounts = {}
 }

  // TODO: is still here because of the plugin API
  // can be removed later when we update the API
  createVMAccount (newAccount) {
    const { privateKey, balance } = newAccount
    this.RemixSimulatorProvider.Accounts._addAccount(privateKey, balance)
    const privKey = Buffer.from(privateKey, 'hex')
    return '0x' + privateToAddress(privKey).toString('hex')
  }

  newAccount (_passwordPromptCb, cb) {
    this.RemixSimulatorProvider.Accounts.newAccount(cb)
  }

  getBalanceInEther (address, cb) {
    address = stripHexPrefix(address)
    this.web3.eth.getBalance(address, (err, res) => {
      cb(null, Web3.utils.fromWei(new BN(res).toString(10), 'ether'))
    })
 }

  getGasPrice (cb) {
    this.web3.eth.getBalance(address, cb)
  }

  signMessage (message, account, _passphrase, cb) {
    console.dir("-----")
    console.dir("--- signMessage")
    const hashedMsg = Web3.utils.sha3(message)
    try {
      // this.web3.eth.sign(account, hashedMsg, (error, signedData) => {
      this.web3.eth.sign(hashedMsg, account, (error, signedData) => {
        if (error) {
          return cb(error)
        }
        console.dir("------")
        console.dir(error)
        console.dir("------")
        cb(null, hashedMsg, signedData)
      })
    } catch (e) {
      console.dir("======")
      console.dir(e)
      console.dir("======")
      cb(e.message)
    }
  //   const personalMsg = ethJSUtil.hashPersonalMessage(Buffer.from(message))
  //   // const privKey = this.providers.vm.accounts[account].privateKey
  //   const privKey = this.RemixSimulatorProvider.Accounts.accounts[account].privateKey
  //   try {
  //     const rsv = ethJSUtil.ecsign(personalMsg, privKey)
  //     const signedData = ethJSUtil.toRpcSig(rsv.v, rsv.r, rsv.s)
  //     cb(null, '0x' + personalMsg.toString('hex'), signedData)
  //   } catch (e) {
  //     cb(e.message)
  //   }
  }

  getProvider () {
    return 'vm'
  }
}

module.exports = VMProvider
