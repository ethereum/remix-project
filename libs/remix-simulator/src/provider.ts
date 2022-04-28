import { Blocks } from './methods/blocks'

import { info } from './utils/logs'
import merge from 'merge'

import { Accounts } from './methods/accounts'
import { Filters } from './methods/filters'
import { methods as miscMethods } from './methods/misc'
import { methods as netMethods } from './methods/net'
import { Transactions } from './methods/transactions'
import { Debug } from './methods/debug'
import { generateBlock } from './genesis'
import { VMContext } from './vm-context'

export class Provider {
  options: Record<string, unknown>
  vmContext
  Accounts
  Transactions
  methods
  connected: boolean;

  constructor (options: Record<string, unknown> = {}) {
    this.options = options
    this.connected = true
    this.vmContext = new VMContext(options['fork'])

    this.Accounts = new Accounts(this.vmContext)
    this.Transactions = new Transactions(this.vmContext)

    this.methods = {}
    this.methods = merge(this.methods, this.Accounts.methods())
    this.methods = merge(this.methods, (new Blocks(this.vmContext, options)).methods())
    this.methods = merge(this.methods, miscMethods())
    this.methods = merge(this.methods, (new Filters(this.vmContext)).methods())
    this.methods = merge(this.methods, netMethods())
    this.methods = merge(this.methods, this.Transactions.methods())
    this.methods = merge(this.methods, (new Debug(this.vmContext)).methods())
  }

  async init () {
    await generateBlock(this.vmContext)
    await this.Accounts.resetAccounts()
    this.Transactions.init(this.Accounts.accounts)
  }

  sendAsync (payload, callback) {
    // log.info('payload method is ', payload.method) // commented because, this floods the IDE console

    const method = this.methods[payload.method]
    if (this.options.logDetails) {
      info(payload)
    }
    if (method) {
      return method.call(method, payload, (err, result) => {
        if (this.options.logDetails) {
          info(err)
          info(result)
        }
        if (err) {
          return callback(err)
        }
        const response = { id: payload.id, jsonrpc: '2.0', result: result }
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

  disconnect () {
    return false
  }

  supportsSubscriptions () {
    return true
  }

  on (type, cb) {
    this.vmContext.logsManager.addListener(type, cb)
  }
}

export function extend (web3) {
  if (!web3.extend) {
    return
  }
  // DEBUG
  const methods = []
  if (!(web3.eth && web3.eth.getExecutionResultFromSimulator)) {
    methods.push(new web3.extend.Method({
      name: 'getExecutionResultFromSimulator',
      call: 'eth_getExecutionResultFromSimulator',
      inputFormatter: [null],
      params: 1
    }))
  }

  if (!(web3.eth && web3.eth.getHHLogsForTx)) {
    methods.push(new web3.extend.Method({
      name: 'getHHLogsForTx',
      call: 'eth_getHHLogsForTx',
      inputFormatter: [null],
      params: 1
    }))
  }

  if (!(web3.eth && web3.eth.getHashFromTagBySimulator)) {
    methods.push(new web3.extend.Method({
      name: 'getHashFromTagBySimulator',
      call: 'eth_getHashFromTagBySimulator',
      inputFormatter: [null],
      params: 1
    }))
  }

  if (methods.length > 0) {
    web3.extend({
      property: 'eth',
      methods: methods,
      properties: []
    })
  }
}
