'use strict'
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import { joinPath } from '../../lib/helper'
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
  }

  _JSONFileName (path, contractName) {
    return joinPath(path, this.innerPath, contractName + '.json')
  }

  _MetadataFileName (path, contractName) {
    return joinPath(path, this.innerPath, contractName + '_metadata.json')
  }

  createHardhatArtifacts (compiledContract, provider) {
    const contract = compiledContract
    var hhArtifactsFileName = joinPath('artifacts',contract.file, contract.name + '.json')
    const hhArtifactsdata = {
      '_format': 'hh-sol-artifact-1',
      'contractName': contract.name,
      'sourceName': contract.file,
      'abi': contract.object.abi,
      'bytecode': contract.object.evm.bytecode.object,
      'deployedBytecode': contract.object.evm.deployedBytecode.object,
      'linkReferences': contract.object.evm.bytecode.linkReferences,
      'deployedLinkReferences': contract.object.evm.deployedBytecode.linkReferences,
    }
    provider.set(hhArtifactsFileName, JSON.stringify(hhArtifactsdata, null, '\t'))

    var hhArtifactsDbgFileName = joinPath('artifacts',contract.file, contract.name + '.dbg.json')
    const hhArtifactsDbgdata = {
      '_format': 'hh-sol-dbg-1',
    }
    provider.set(hhArtifactsDbgFileName, JSON.stringify(hhArtifactsDbgdata, null, '\t'))
  }

  onActivation () {
    var self = this
    this.on('solidity', 'compilationFinished', (file, source, languageVersion, data) => {
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
              self.createHardhatArtifacts(contract, provider)
              try {
                parsedMetadata = JSON.parse(contract.object.metadata)
              } catch (e) {
                console.log(e)
              }
              if (parsedMetadata) provider.set(metadataFileName, JSON.stringify(parsedMetadata, null, '\t'))

              var data = {
                deploy,
                data: {
                  bytecode: contract.object.evm.bytecode,
                  deployedBytecode: contract.object.evm.deployedBytecode,
                  gasEstimates: contract.object.evm.gasEstimates,
                  methodIdentifiers: contract.object.evm.methodIdentifiers
                },
                abi: contract.object.abi
              }

              provider.set(fileName, JSON.stringify(data, null, '\t'))
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
