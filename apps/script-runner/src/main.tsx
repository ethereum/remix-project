import "@babel/polyfill"
import * as ts from "typescript";
import { createClient } from "@remixproject/plugin-webview";
import { PluginClient } from '@remixproject/plugin'
import * as ethersJs from 'ethers' // eslint-disable-line
import multihash from 'multihashes';
import * as web3Js from 'web3'
import Web3 from 'web3'
import { waffleChai } from "@ethereum-waffle/chai";
import * as starknet from 'starknet'
import * as zokratesJs from 'zokrates-js';
import './runWithMocha'
import * as path from 'path'
import * as hhEtherMethods from './hardhat-ethers/methods'
import * as chai from 'chai'
chai.use(waffleChai);

(window as any).starknet = starknet;
(window as any).chai = chai;
(window as any).ethers = ethersJs;
(window as any).multihashes = multihash;
(window as any)['zokrates-js'] = zokratesJs;

const scriptReturns: { [Key: string]: any; } = {} // keep track of modules exported values
const fileContents: { [Key: string]: any; } = {}; // keep track of file content
(window as any).require = (module) => {
  if (module === 'web3') return web3Js
  if (window[module]) return window[module] // library
  else if ((module.endsWith('.json') || module.endsWith('.abi')) && (window as any).__execPath__ && fileContents[(window as any).__execPath__]) return JSON.parse(fileContents[(window as any).__execPath__][module])
  else if ((window as any).__execPath__ && scriptReturns[(window as any).__execPath__]) return scriptReturns[(window as any).__execPath__][module] // module exported values
  else throw new Error(`${module} module require is not supported by Remix IDE`)
}

class CodeExecutor extends PluginClient {
  async execute (script: string, filePath: string) {
    filePath = filePath || 'scripts/script.ts'
    const paths = filePath.split('/')
    paths.pop()
    const fromPath = paths.join('/') // get current execcution context path
    if (script) {
      try {
        const output = ts.transpileModule(script, { moduleName: filePath,
        compilerOptions: {
         target: ts.ScriptTarget.ES2015,
         module: ts.ModuleKind.CommonJS,
         esModuleInterop: true,  
        }});
        script = output.outputText;
        // extract all the "require", execute them and store the returned values.
        const regexp = /require\((.*?)\)/g
        const array = [...script.matchAll(regexp)];

        for (const regex of array) {
          let file = regex[1]
          file = file.slice(0, -1).slice(1) // remove " and '
          let absolutePath = file
          if (file.startsWith('./') || file.startsWith('../')) {            
            absolutePath = path.resolve(fromPath, file)
          }
          if (!scriptReturns[fromPath]) scriptReturns[fromPath] = {}
          if (!fileContents[fromPath]) fileContents[fromPath] = {}
          const { returns, content } = await this.executeFile(absolutePath)
          scriptReturns[fromPath][file] = returns
          fileContents[fromPath][file] = content
        }

        // execute the script
        script = `const exports = {};
                  const module = { exports: {} }
                  window.__execPath__ = "${fromPath}"
                  ${script};
                  return exports || module.exports`
        const returns = (new Function(script))()
        if (mocha.suite && ((mocha.suite.suites && mocha.suite.suites.length) || (mocha.suite.tests && mocha.suite.tests.length))) {
          console.log(`RUNS ${filePath}....`)
          mocha.run()
        }
        return returns
      } catch (e: any) {
        this.emit('error', {
          data: [e.message]
        })
      }
    }
  }

  async _resolveFile (fileName: string) {
    if (await this.call('fileManager' as any, 'exists', fileName)) return await this.call('fileManager', 'readFile', fileName)
    if (await this.call('fileManager' as any, 'exists', fileName + '.ts')) return await this.call('fileManager', 'readFile', fileName + '.ts')
    if (await this.call('fileManager' as any, 'exists', fileName + '.js')) return await this.call('fileManager', 'readFile', fileName + '.js')
    return ''
  }

  async executeFile (fileName: string) {
    try {
      if (require(fileName)) return require(fileName)
    } catch (e) {}
    const content = await this._resolveFile(fileName)
    const returns = await this.execute(content, fileName)
    return {returns, content}
  }
}

const remix = new CodeExecutor()
createClient(remix)

const web3Provider = {
  sendAsync(payload: string[], callback: any) {
    remix.call('web3Provider' as any, 'sendAsync', payload)
      .then(result => callback(null, result))
      .catch(e => callback(e))
  }
};
(window as any).provider = web3Provider;
(window as any).ethereum = web3Provider;

(window as any).web3 = new Web3(web3Provider as any);

// Support hardhat-ethers, See: https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html
const { ethers } = ethersJs as any;
(ethers as any).provider = new ethers.providers.Web3Provider(web3Provider);
(window as any).hardhat = { ethers };
for(const method in hhEtherMethods) Object.defineProperty((window as any).hardhat.ethers, method, { value: hhEtherMethods[method]});

(console as any).logInternal = console.log
console.log = function () {
   remix.emit('log', {
     data: Array.from(arguments).map((el) => JSON.parse(JSON.stringify(el)))
   })
 };

(console as any).infoInternal = console.info
console.info = function () {
  remix.emit('info', {
    data: Array.from(arguments).map((el) => JSON.parse(JSON.stringify(el)))
  })
};

(console as any).warnInternal = console.warn
console.warn = function () {
  remix.emit('warn', {
    data: Array.from(arguments).map((el) => JSON.parse(JSON.stringify(el)))
  })
};

(console as any).errorInternal = console.error
console.error = function () {
  remix.emit('error', {
    data: Array.from(arguments).map((el) => JSON.parse(JSON.stringify(el)))
  })
}

