import { EventEmitter } from 'events'
import { Compiler } from 'remix-solidity'
import { canUseWorker, urlFromVersion } from './compiler-utils'
import CompilerAbstract from './compiler-abstract'
import remixLib from 'remix-lib'

class FetchAndCompile {

  constructor () {
    this.event = new EventEmitter()
    this.compiler = null
    this.unresolvedAddresses = []
    this.firstResolvedAddress = null
    this.sourceVerifierNetWork = ['Main', 'Rinkeby', 'Ropsten', 'Goerli']
  }

  /**
   * Fetch compiliation metadata from source-Verify from a given @arg contractAddress - https://github.com/ethereum/source-verify
   * Compile the code using Solidity compiler.
   * if no contract address are passed, we default to the first resolved address.
   *
   * @param {string} contractAddress - Address of the contrac to resolve
   * @param {string} compilersartefacts - Object containing a mapping of compilation results (byContractAddress and __last)
   * @param {object} pluginAccess - any registered plugin (for making the calls)
   * @return {CompilerAbstract} - compilation data targeting the given @arg contractAddress
   */
  async resolve (contractAddress, compilersartefacts, pluginAccess, targetPath, web3) {
    contractAddress = contractAddress || this.firstResolvedAddress

    const localCompilation = () => compilersartefacts.get('__last') ? compilersartefacts.get('__last') : null

    const resolved = compilersartefacts.get(contractAddress)
    if (resolved) return resolved
    if (this.unresolvedAddresses.includes(contractAddress)) return localCompilation()
    if (this.firstResolvedAddress) return compilersartefacts.get(this.firstResolvedAddress)
    // ^ for the moment we don't add compilation result for each adddress, but just for the root addres ^ . We can add this later.
    // usecase is: sometimes when doing an internal call, the only available artifact is the Solidity interface.
    // resolving addresses of internal call would allow to step over the source code, even if the declaration was made using an Interface.

    let network
    try {
      network = await pluginAccess.call('network', 'detectNetwork')
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
        this.firstResolvedAddress = contractAddress
        setTimeout(_ => this.event.emit('usingLocalCompilation', contractAddress), 0)
        return compilation
      }
    }

    let name = network.name.toLowerCase()
    name === 'main' ? 'mainnet' : name // source-verifier api expect "mainnet" and not "main"
    await pluginAccess.call('manager', 'activatePlugin', 'source-verification')
    const data = await pluginAccess.call('source-verification', 'fetch', contractAddress, name.toLowerCase())
    if (!data || !data.metadata) {
      setTimeout(_ => this.event.emit('notFound', contractAddress), 0)
      this.unresolvedAddresses.push(contractAddress)
      return localCompilation()
    }

    // set the solidity contract code using metadata
    await pluginAccess.call('fileManager', 'setFile', `${targetPath}/${contractAddress}/metadata.json`, JSON.stringify(data.metadata, null, '\t'))
    let compilationTargets = {}
    for (let file in data.metadata.sources) {
      const urls = data.metadata.sources[file].urls
      for (let url of urls) {
        if (url.includes('ipfs')) {
          let stdUrl = `ipfs://${url.split('/')[2]}`
          const source = await pluginAccess.call('contentImport', 'resolve', stdUrl)
          file = file.replace('browser/', '') // should be fixed in the remix IDE end.
          const path = `${targetPath}/${contractAddress}/${file}`
          await pluginAccess.call('fileManager', 'setFile', path, source.content)
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
    return await (() => {
      return new Promise((resolve, reject) => {
        setTimeout(_ => this.event.emit('compiling', settings), 0)
        if (!this.compiler) this.compiler = new Compiler(() => {})
        this.compiler.set('evmVersion', settings.evmVersion)
        this.compiler.set('optimize', settings.optimize)
        this.compiler.loadVersion(canUseWorker(settings.version), settings.compilerUrl)
        this.compiler.event.register('compilationFinished', (success, compilationData, source) => {
          if (!success) {
            this.unresolvedAddresses.push(contractAddress)
            setTimeout(_ => this.event.emit('compilationFailed', compilationData), 0)
            return resolve(null)
          }
          const compilerData = new CompilerAbstract(settings.version, compilationData, source)
          compilersartefacts.addResolvedContract(contractAddress, compilerData)
          this.firstResolvedAddress = contractAddress
          resolve(compilerData)
        })
        this.compiler.event.register('compilerLoaded', (version) => {
          this.compiler.compile(compilationTargets, '')
        })
      })
    })()
  }
}

const fetchAndCompile = new FetchAndCompile()

export default fetchAndCompile
