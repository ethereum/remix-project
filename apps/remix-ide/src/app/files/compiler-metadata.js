'use strict'
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import { joinPath } from '../../lib/helper'
import { relative, dirname, join } from 'path'
import { createHash } from 'crypto'
var equal = require('deep-equal')
var CompilerAbstract = require('../compiler/compiler-abstract')

const profile = {
  name: 'compilerMetadata',
  methods: ['deployMetadataOf'],
  events: [],
  version: packageJson.version
}

class CompilerMetadata extends Plugin {
  constructor (blockchain, fileManager, config) {
    super(profile)
    this.blockchain = blockchain
    this.fileManager = fileManager
    this.config = config
    this.networks = ['VM:-', 'main:1', 'ropsten:3', 'rinkeby:4', 'kovan:42', 'görli:5', 'Custom']
    this.innerPath = 'artifacts'
    this.hardhdatConstants = {
      ARTIFACT_FORMAT_VERSION: 'hh-sol-artifact-1',
      DEBUG_FILE_FORMAT_VERSION: 'hh-sol-dbg-1',
      BUILD_INFO_FORMAT_VERSION: 'hh-sol-build-info-1',
      BUILD_INFO_DIR_NAME: 'build-info',
      SOLIDITY_FILES_CACHE_FILENAME: 'solidity-files-cache.json',
      CACHE_FILE_FORMAT_VERSION: 'hh-sol-cache-2'
    }
  }

  _JSONFileName (path, contractName) {
    return joinPath(path, this.innerPath, contractName + '.json')
  }

  _MetadataFileName (path, contractName) {
    return joinPath(path, this.innerPath, contractName + '_metadata.json')
  }

  _getBuildInfoId (solcVersion, solcLongVersion, input) {
    const json = JSON.stringify({
      _format: this.hardhdatConstants.BUILD_INFO_FORMAT_VERSION,
      solcVersion,
      solcLongVersion,
      input
    })
    return createHash('md5').update(Buffer.from(json)).digest().toString('hex')
  }

  async checkHardhatCache (compiledContract, provider, input, output, versionString) {
    const cacheData = {
      _format: this.hardhdatConstants.CACHE_FILE_FORMAT_VERSION
    }
    let fileContent = await this.fileManager.getFileContent(compiledContract.file)
    const contentHash = createHash('md5').update(Buffer.from(fileContent)).digest().toString('hex')
    const solcConfig = {
      version: versionString.substring(0, versionString.indexOf('+commit')),
      settings: input.settings
    }
    if (this.fileManager.exists('cache/' + this.hardhdatConstants.SOLIDITY_FILES_CACHE_FILENAME)) {
      let cache = await this.fileManager.getFileContent('cache/' + this.hardhdatConstants.SOLIDITY_FILES_CACHE_FILENAME)
      cache = JSON.parse(cache)
      const fileCache = cache[compiledContract.file]
      if (!fileCache || fileCache.contentHash !== contentHash || (solcConfig && !equal(fileCache.solcConfig, solcConfig))) {
        cache[compiledContract.file] = {
          lastModificationDate: Date.now(),
          contentHash,
          sourceName: compiledContract.file,
          solcConfig,
          artifacts: [compiledContract.name]
        }
        await this.fileManager.setFileContent('cache/' + this.hardhdatConstants.SOLIDITY_FILES_CACHE_FILENAME, JSON.stringify(cache, null, '\t'))
        this.createHardhatArtifacts(compiledContract, provider, input, output, versionString)
      } else { console.log('No compilation needed') }
    } else {
      cacheData[compiledContract.file] = {
        lastModificationDate: Date.now(),
        contentHash,
        sourceName: compiledContract.file,
        solcConfig,
        artifacts: [compiledContract.name]
      }
      await this.fileManager.setFileContent('cache/' + this.hardhdatConstants.SOLIDITY_FILES_CACHE_FILENAME, JSON.stringify(cacheData, null, '\t'))
      this.createHardhatArtifacts(compiledContract, provider, input, output, versionString)
    }
  }

  createHardhatArtifacts (compiledContract, provider, input, output, versionString) {
    const contract = compiledContract
    const hhArtifactsFileName = joinPath('artifacts', contract.file, contract.name + '.json')
    const hhArtifactsData = {
      _format: this.hardhdatConstants.ARTIFACT_FORMAT_VERSION,
      contractName: contract.name,
      sourceName: contract.file,
      abi: contract.object.abi,
      bytecode: contract.object.evm.bytecode.object,
      deployedBytecode: contract.object.evm.deployedBytecode.object,
      linkReferences: contract.object.evm.bytecode.linkReferences,
      deployedLinkReferences: contract.object.evm.deployedBytecode.linkReferences
    }
    provider.set(hhArtifactsFileName, JSON.stringify(hhArtifactsData, null, '\t'))

    const solcVersion = versionString.substring(0, versionString.indexOf('+commit'))
    const buildInfoId = this._getBuildInfoId(solcVersion, versionString, input)
    const hhArtifactsBuildFileName = joinPath('artifacts', this.hardhdatConstants.BUILD_INFO_DIR_NAME, buildInfoId + '.json')
    const hhArtifactsBuildData = {
      id: buildInfoId,
      _format: this.hardhdatConstants.BUILD_INFO_FORMAT_VERSION,
      solcVersion,
      solcLongVersion: versionString,
      input,
      output
    }
    provider.set(hhArtifactsBuildFileName, JSON.stringify(hhArtifactsBuildData, null, '\t'))

    const hhArtifactsDbgFileName = joinPath('artifacts', contract.file, contract.name + '.dbg.json')
    const hhArtifactsDbgData = {
      _format: this.hardhdatConstants.DEBUG_FILE_FORMAT_VERSION,
      buildInfo: join(relative(dirname(hhArtifactsDbgFileName), dirname(hhArtifactsBuildFileName)), buildInfoId + '.json')
    }
    provider.set(hhArtifactsDbgFileName, JSON.stringify(hhArtifactsDbgData, null, '\t'))
  }

  onActivation () {
    var self = this
    this.on('solidity', 'compilationFinished', (file, source, languageVersion, data, compilerInput) => {
      if (!self.config.get('settings/generate-contract-metadata')) return
      const compiler = new CompilerAbstract(languageVersion, data, source)
      var provider = self.fileManager.fileProviderOf(source.target)
      var path = self.fileManager.extractPathOf(source.target)
      if (provider) {
        compiler.visitContracts((contract) => {
          if (contract.file !== source.target) return

          var fileName = self._JSONFileName(path, contract.name)
          var metadataFileName = self._MetadataFileName(path, contract.name)
          provider.get(fileName, (error, content) => {
            if (!error) {
              content = content || '{}'
              var metadata
              try {
                metadata = JSON.parse(content)
              } catch (e) {
                console.log(e)
              }

              var deploy = metadata.deploy || {}
              self.networks.forEach((network) => {
                deploy[network] = self._syncContext(contract, deploy[network] || {})
              })

              let parsedMetadata
              let parsedInput
              try {
                parsedMetadata = JSON.parse(contract.object.metadata)
                parsedInput = JSON.parse(compilerInput)
              } catch (e) {
                console.log(e)
              }
              if (parsedMetadata) provider.set(metadataFileName, JSON.stringify(parsedMetadata, null, '\t'))
              if (parsedInput) self.checkHardhatCache(contract, provider, parsedInput, data, parsedMetadata.compiler.version).then(console.log)
                

              var evmData = {
                deploy,
                data: {
                  bytecode: contract.object.evm.bytecode,
                  deployedBytecode: contract.object.evm.deployedBytecode,
                  gasEstimates: contract.object.evm.gasEstimates,
                  methodIdentifiers: contract.object.evm.methodIdentifiers
                },
                abi: contract.object.abi
              }

              provider.set(fileName, JSON.stringify(evmData, null, '\t'))
            }
          })
        })
      }
    })
  }

  _syncContext (contract, metadata) {
    var linkReferences = metadata.linkReferences
    var autoDeployLib = metadata.autoDeployLib
    if (!linkReferences) linkReferences = {}
    if (autoDeployLib === undefined) autoDeployLib = true

    for (var libFile in contract.object.evm.bytecode.linkReferences) {
      if (!linkReferences[libFile]) linkReferences[libFile] = {}
      for (var lib in contract.object.evm.bytecode.linkReferences[libFile]) {
        if (!linkReferences[libFile][lib]) {
          linkReferences[libFile][lib] = '<address>'
        }
      }
    }
    metadata.linkReferences = linkReferences
    metadata.autoDeployLib = autoDeployLib
    return metadata
  }

  // TODO: is only called by dropdownLogic and can be moved there
  deployMetadataOf (contractName, fileLocation) {
    return new Promise((resolve, reject) => {
      var provider
      let path
      if (fileLocation) {
        provider = this.fileManager.fileProviderOf(fileLocation)
        path = fileLocation.split('/')
        path.pop()
        path = path.join('/')
      } else {
        provider = this.fileManager.currentFileProvider()
        path = this.fileManager.currentPath()
      }

      if (provider) {
        this.blockchain.detectNetwork((err, { id, name } = {}) => {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            var fileName = this._JSONFileName(path, contractName)
            provider.get(fileName, (error, content) => {
              if (error) return reject(error)
              if (!content) return resolve()
              try {
                var metadata = JSON.parse(content)
                metadata = metadata.deploy || {}
                return resolve(metadata[name + ':' + id] || metadata[name] || metadata[id] || metadata[name.toLowerCase() + ':' + id] || metadata[name.toLowerCase()])
              } catch (e) {
                reject(e.message)
              }
            })
          }
        })
      } else {
        reject(new Error(`Please select the folder in the file explorer where the metadata of ${contractName} can be found`))
      }
    })
  }
}

module.exports = CompilerMetadata
