import React from 'react' // eslint-disable-line
import { format } from 'util'
import { Plugin } from '@remixproject/engine'
import { compile } from '@remix-project/remix-solidity'
import { TransactionConfig } from 'web3-core'
const _paq = window._paq = window._paq || []  //eslint-disable-line

const profile = {
  name: 'solidity-script',
  displayName: 'solidity-script',
  description: 'solidity-script',
  methods: ['execute']
}

export class SolidityScript extends Plugin {
  constructor () {
    super(profile)
  }

  async execute (path: string, functionName: string = 'run') {
    _paq.push(['trackEvent', 'SolidityScript', 'execute', 'script'])
    this.call('terminal', 'log', `Running free function '${functionName}' from ${path}...`)
    let content = await this.call('fileManager', 'readFile', path)
    const params = await this.call('solidity', 'getCompilerParameters')


    content = `
      // SPDX-License-Identifier: GPL-3.0

      pragma solidity >=0.7.1;

      import "${path}";

      contract SolidityScript {
          constructor () {}

          function remixRun () public view {
              ${functionName}();
          }
      }`
    const targets = { 'script.sol': { content } }

    // compile
    const compilation = await compile(targets, params, async (url, cb) => {
      await this.call('contentImport', 'resolveAndSave', url).then((result) => cb(null, result)).catch((error) => cb(error.message))
    })
    
    if (compilation.data.error) {
      this.call('terminal', 'log', compilation.data.error.formattedMessage)
    }
    if (compilation.data.errors && compilation.data.errors.length > 0) {
      compilation.data.errors.map((error) => {
        this.call('terminal', 'log', error.formattedMessage)
      })
    }
    
    // get the contract
    const contract = compilation.getContract('SolidityScript')
    if (!contract) {
      console.log('compilation failed')
      return
    }
    const bytecode = '0x' + contract.object.evm.bytecode.object
    const web3 = await this.call('blockchain', 'web3VM')
    const accounts = await this.call('blockchain', 'getAccounts')
    if (!accounts || accounts.length === 0) {
      throw new Error('no account available')
    }

    // deploy the contract
    let tx: TransactionConfig = {
      from: accounts[0],
      data: bytecode
    }
    const receipt = await web3.eth.sendTransaction(tx)
    tx = {
      from: accounts[0],
      to: receipt.contractAddress,
      data: '0x69d4394b' // function remixRun() public
    }
    const receiptCall = await web3.eth.sendTransaction(tx)

    const hhlogs = await web3.eth.getHHLogsForTx(receiptCall.transactionHash)

    if (hhlogs && hhlogs.length) {
      const finalLogs = <div><div><b>console.log:</b></div>
      {
        hhlogs.map((log) => {
          let formattedLog
          // Hardhat implements the same formatting options that can be found in Node.js' console.log,
          // which in turn uses util.format: https://nodejs.org/dist/latest-v12.x/docs/api/util.html#util_util_format_format_args
          // For example: console.log("Name: %s, Age: %d", remix, 6) will log 'Name: remix, Age: 6'
          // We check first arg to determine if 'util.format' is needed
          if (typeof log[0] === 'string' && (log[0].includes('%s') || log[0].includes('%d'))) {
            formattedLog = format(log[0], ...log.slice(1))
          } else {
            formattedLog = log.join(' ')
          }
          return <div>{formattedLog}</div>
      })}
      </div>          
      _paq.push(['trackEvent', 'udapp', 'hardhat', 'console.log'])
      this.call('terminal', 'logHtml', finalLogs)
    }
  }  
}
