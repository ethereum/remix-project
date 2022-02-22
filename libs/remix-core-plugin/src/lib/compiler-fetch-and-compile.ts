
import { Plugin } from '@remixproject/engine'
import { compile } from '@remix-project/remix-solidity'
import { util } from '@remix-project/remix-lib'
import { toChecksumAddress } from 'ethereumjs-util'

const profile = {
  name: 'fetchAndCompile',
  methods: ['resolve'],
  version: '0.0.1'
}

export class FetchAndCompile extends Plugin {
  unresolvedAddresses: any[]
  sourceVerifierNetWork: string[]
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
   * @param {string} deployedBytecode - deployedBytecode of the contract
   * @param {string} targetPath - Folder where to save the compilation arfefacts
   * @return {CompilerAbstract} - compilation data targeting the given @arg contractAddress
   */
  async resolve (contractAddress, codeAtAddress, targetPath) {
    contractAddress = toChecksumAddress(contractAddress)

    const localCompilation = async () => await this.call('compilerArtefacts', 'get', contractAddress) ? await this.call('compilerArtefacts', 'get', contractAddress) : await this.call('compilerArtefacts', 'get', '__last') ? await this.call('compilerArtefacts', 'get', '__last') : null

    const resolved = await this.call('compilerArtefacts', 'get', contractAddress)
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
    const compilation = await localCompilation()
    if (compilation) {
      let found = false
      compilation.visitContracts((contract) => {
        found = util.compareByteCode('0x' + contract.object.evm.deployedBytecode.object, codeAtAddress)
        return found
      })
      if (found) {
        await this.call('compilerArtefacts', 'addResolvedContract', contractAddress, compilation)
        setTimeout(_ => this.emit('usingLocalCompilation', contractAddress), 0)
        return compilation
      }
    }

    let data
    try {
      data = await this.call('sourcify', 'fetchByNetwork', contractAddress, network.id)
    } catch (e) {
      setTimeout(_ => this.emit('notFound', contractAddress), 0) // plugin framework returns a time out error although it actually didn't find the source...
      this.unresolvedAddresses.push(contractAddress)
      return localCompilation()
    }
    if (!data || !data.metadata) {
      setTimeout(_ => this.emit('notFound', contractAddress), 0)
      this.unresolvedAddresses.push(contractAddress)
      return localCompilation()
    }

    // set the solidity contract code using metadata
    await this.call('fileManager', 'setFile', `${targetPath}/${network.id}/${contractAddress}/metadata.json`, JSON.stringify(data.metadata, null, '\t'))
    const compilationTargets = {}
    for (let file in data.metadata.sources) {
      const urls = data.metadata.sources[file].urls
      for (const url of urls) {
        if (url.includes('ipfs')) {
          const stdUrl = `ipfs://${url.split('/')[2]}`
          const source = await this.call('contentImport', 'resolve', stdUrl)
          if (await this.call('contentImport', 'isExternalUrl', file)) {
            // nothing to do, the compiler callback will handle those
          } else {
            file = file.replace('browser/', '') // should be fixed in the remix IDE end.
            const path = `${targetPath}/${network.id}/${contractAddress}/${file}`
            await this.call('fileManager', 'setFile', path, source.content)
            compilationTargets[path] = { content: source.content }
          }
          break
        }
      }
    }

    // compile
    const settings = {
      version: data.metadata.compiler.version,
      language: data.metadata.language,
      evmVersion: data.metadata.settings.evmVersion,
      optimize: data.metadata.settings.optimizer.enabled,
      runs: data.metadata.settings.optimizer.runs
    }
    try {
      setTimeout(_ => this.emit('compiling', settings), 0)
      const compData = await compile(
        compilationTargets,
        settings,
        async (url, cb) => await this.call('contentImport', 'resolveAndSave', url).then((result) => cb(null, result)).catch((error) => cb(error.message)))
      await this.call('compilerArtefacts', 'addResolvedContract', contractAddress, compData)
      return compData
    } catch (e) {
      this.unresolvedAddresses.push(contractAddress)
      setTimeout(_ => this.emit('compilationFailed'), 0)
      return localCompilation()
    }
  }
}
