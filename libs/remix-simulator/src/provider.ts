const RemixLib = require('@remix-project/remix-lib')
const executionContext = RemixLib.execution.executionContext

const log = require('./utils/logs.js')
const merge = require('merge')

const Accounts = require('./methods/accounts.js')
import { Blocks } from './methods/blocks'
const Filters = require('./methods/filters.js')
const Misc = require('./methods/misc.js')
const Net = require('./methods/net.js')
const Transactions = require('./methods/transactions.js')
const Debug = require('./methods/debug.js')

const generateBlock = require('./genesis.js')

export class Provider {

  options
  executionContext
  Accounts
  Transactions
  methods

  constructor(options = {}) {
    this.options = options
    // TODO: init executionContext here
    this.executionContext = executionContext
    this.Accounts = new Accounts(this.executionContext)
    this.Transactions = new Transactions(this.executionContext)

    this.methods = {}
    this.methods = merge(this.methods, this.Accounts.methods())
    this.methods = merge(this.methods, (new Blocks(this.executionContext, options)).methods())
    this.methods = merge(this.methods, (new Misc()).methods())
    this.methods = merge(this.methods, (new Filters(this.executionContext)).methods())
    this.methods = merge(this.methods, (new Net()).methods())
    this.methods = merge(this.methods, this.Transactions.methods())
    this.methods = merge(this.methods, (new Debug(this.executionContext)).methods())

    generateBlock(this.executionContext)
    this.init()
  }

  async init () {
    await this.Accounts.resetAccounts()
    this.Transactions.init(this.Accounts.accounts)
  }

  sendAsync (payload, callback) {
    // log.info('payload method is ', payload.method) // commented because, this floods the IDE console

    const method = this.methods[payload.method]
    if (this.options.logDetails) {
      log.info(payload)
    }
    if (method) {
      return method.call(method, payload, (err, result) => {
        if (this.options.logDetails) {
          log.info(err)
          log.info(result)
        }
        if (err) {
          return callback(err)
        }
        const response = {'id': payload.id, 'jsonrpc': '2.0', 'result': result}
        callback(null, response)
      })
    }
    callback(new Error('unknown method ' + payload.method))
  }

  send (payload, callback) {
    this.sendAsync(payload, callback || function () {})
  }

  isConnected () {
    return true
  }

  on (type, cb) {
    this.executionContext.logsManager.addListener(type, cb)
  }
}