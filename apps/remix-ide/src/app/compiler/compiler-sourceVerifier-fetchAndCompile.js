const ethutil = require('ethereumjs-util')
import * as packageJson from '../../../package.json'
import { Plugin } from '@remixproject/engine'
import { urlFromVersion } from './compiler-utils'
import { compile } from './compiler-helpers'
import globalRegistry from '../../global/registry'

import remixLib from 'remix-lib'

const profile = {
  name: 'fetchAndCompile',
  methods: ['resolve'],
  version: packageJson.version
}

export default class FetchAndCompile extends Plugin {

  constructor () {
    super(profile)
    this.unresolvedAddresses = []
    this.sourceVerifierNetWork = ['Main', 'Rinkeby', 'Ropsten', 'Goerli']
  }

  /**
   * Fetch compiliation metadata from source-Verify from a given @arg contractAddress - https://github.com/ethereum/source-verify
   * Put the artifacts in the file explorer
   * Compile the code using Solidity compiler
   * Returns compilation data
   *
   * @param {string} contractAddress - Address of the contrac to resolve
   * @param {string} compilersartefacts - Object containing a mapping of compilation results (byContractAddress and __last)
   * @return {CompilerAbstract} - compilation data targeting the given @arg contractAddress
   */
  async resolve (contractAddress, targetPath, web3) {
    contractAddress = ethutil.toChecksumAddress(contractAddress)
    const compilersartefacts = globalRegistry.get('compilersartefacts').api

    const localCompilation = () => compilersartefacts.get('__last') ? compilersartefacts.get('__last') : null

    const resolved = compilersartefacts.get(contractAddress)
    if (resolved) return resolved
    if (this.unresolvedAddresses.includes(contractAddress)) return localCompilation()

    // sometimes when doing an internal call, the only available artifact is the Solidity interface.
    // resolving addresses of internal call would allow to step over the source code, even if the declaration was made using an Interface.

    let network
    try {
      network = await this.call('network', 'detectNetwork')
    } catch (e) {
      return localCompilation()
    }
    if (!network) return localCompilation()
    if (!this.sourceVerifierNetWork.includes(network.name)) return localCompilation()

    // check if the contract if part of the local compilation result
    const codeAtAddress = await web3.eth.getCode(contractAddress)
    const compilation = localCompilation()
    if (compilation) {
      let found = false
      compilation.visitContracts((contract) => {
        found = remixLib.util.compareByteCode('0x' + contract.object.evm.deployedBytecode.object, codeAtAddress)
        return found
      })
      if (found) {
        compilersartefacts.addResolvedContract(contractAddress, compilation)
        setTimeout(_ => this.emit('usingLocalCompilation', contractAddress), 0)
        return compilation
      }
    }

    let name = network.name.toLowerCase()
    name === 'main' ? 'mainnet' : name // source-verifier api expect "mainnet" and not "main"
    let data
    try {
      data = await this.call('source-verification', 'fetch', contractAddress, name.toLowerCase())
    } catch (e) {
      setTimeout(_ => this.emit('sourceVerificationNotAvailable'), 0)
      this.unresolvedAddresses.push(contractAddress)
      return localCompilation()
    }
    if (!data || !data.metadata) {
      setTimeout(_ => this.emit('notFound', contractAddress), 0)
      this.unresolvedAddresses.push(contractAddress)
      return localCompilation()
    }

    // set the solidity contract code using metadata
    await this.call('fileManager', 'setFile', `${targetPath}/${name}/${contractAddress}/metadata.json`, JSON.stringify(data.metadata, null, '\t'))
    let compilationTargets = {}
    for (let file in data.metadata.sources) {
      const urls = data.metadata.sources[file].urls
      for (let url of urls) {
        if (url.includes('ipfs')) {
          let stdUrl = `ipfs://${url.split('/')[2]}`
          const source = await this.call('contentImport', 'resolve', stdUrl)
          file = file.replace('browser/', '') // should be fixed in the remix IDE end.
          const path = `${targetPath}/${name}/${contractAddress}/${file}`
          await this.call('fileManager', 'setFile', path, source.content)
          compilationTargets[path] = { content: source.content }
          break
        }
      }
    }

    // compile
    const settings = {
      version: data.metadata.compiler.version,
      languageName: data.metadata.language,
      evmVersion: data.metadata.settings.evmVersion,
      optimize: data.metadata.settings.optimizer.enabled,
      compilerUrl: urlFromVersion(data.metadata.compiler.version)
    }
    try {
      setTimeout(_ => this.emit('compiling', settings), 0)
      const compData = await compile(compilationTargets, settings)
      compilersartefacts.addResolvedContract(contractAddress, compData)
      return compData
    } catch (e) {
      this.unresolvedAddresses.push(contractAddress)
      setTimeout(_ => this.emit('compilationFailed'), 0)
      return localCompilation()
    }
  }
}
