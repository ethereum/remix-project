'use strict'
import { Plugin } from '@remixproject/engine'
import { CompilerAbstract } from '@remix-project/remix-solidity'

const profile = {
  name: 'compilerMetadata',
  methods: ['deployMetadataOf'],
  events: [],
  version: '0.0.1'
}

export class CompilerMetadata extends Plugin {
  networks: string[]
  innerPath: string
  constructor () {
    super(profile)
    this.networks = ['VM:-', 'main:1', 'ropsten:3', 'rinkeby:4', 'kovan:42', 'görli:5', 'Custom']
    this.innerPath = 'artifacts'
  }

  _JSONFileName (path, contractName) {
    return this.joinPath(path, this.innerPath, contractName + '.json')
  }

  _MetadataFileName (path, contractName) {
    return this.joinPath(path, this.innerPath, contractName + '_metadata.json')
  }

  _OutputFileName (path, target) {
    return this.joinPath(path, this.innerPath, 'output/' +  target.replace('/', '_') + '.json')
  }

  onActivation () {
    const self = this
    this.on('solidity', 'compilationFinished', async (file, source, languageVersion, data) => {
      if (!await this.call('settings', 'get', 'settings/generate-contract-metadata')) return
      const compiler = new CompilerAbstract(languageVersion, data, source)
      const path = self._extractPathOf(source.target)
      const outputFileName = this._OutputFileName(path, source.target)
      await this.call('fileManager', 'writeFile', outputFileName, JSON.stringify(data, null, '\t'))
      compiler.visitContracts((contract) => {
        if (contract.file !== source.target) return
        (async () => {
          const fileName = self._JSONFileName(path, contract.name)
          const content = await this.call('fileManager', 'exists', fileName) ? await this.call('fileManager', 'readFile', fileName) : null
          await this._setArtefacts(content, contract, path)
        })()
      })
    })
  }

  _extractPathOf (file) {
    const reg = /(.*)(\/).*/
    const path = reg.exec(file)
    return path ? path[1] : '/'
  }

  async _setArtefacts (content, contract, path) {
    content = content || '{}'
    const fileName = this._JSONFileName(path, contract.name)
    const metadataFileName = this._MetadataFileName(path, contract.name)

    let metadata
    try {
      metadata = JSON.parse(content)
    } catch (e) {
      console.log(e)
    }

    const deploy = metadata.deploy || {}
    this.networks.forEach((network) => {
      deploy[network] = this._syncContext(contract, deploy[network] || {})
    })

    let parsedMetadata
    try {
      parsedMetadata = JSON.parse(contract.object.metadata)
    } catch (e) {
      console.log(e)
    }
    if (parsedMetadata) await this.call('fileManager', 'writeFile', metadataFileName, JSON.stringify(parsedMetadata, null, '\t'))

    const data = {
      deploy,
      data: {
        bytecode: contract.object.evm.bytecode,
        deployedBytecode: contract.object.evm.deployedBytecode,
        gasEstimates: contract.object.evm.gasEstimates,
        methodIdentifiers: contract.object.evm.methodIdentifiers
      },
      abi: contract.object.abi
    }
    await this.call('fileManager', 'writeFile', fileName, JSON.stringify(data, null, '\t'))
  }

  _syncContext (contract, metadata) {
    let linkReferences = metadata.linkReferences
    let autoDeployLib = metadata.autoDeployLib
    if (!linkReferences) linkReferences = {}
    if (autoDeployLib === undefined) autoDeployLib = true

    for (const libFile in contract.object.evm.bytecode.linkReferences) {
      if (!linkReferences[libFile]) linkReferences[libFile] = {}
      for (const lib in contract.object.evm.bytecode.linkReferences[libFile]) {
        if (!linkReferences[libFile][lib]) {
          linkReferences[libFile][lib] = '<address>'
        }
      }
    }
    metadata.linkReferences = linkReferences
    metadata.autoDeployLib = autoDeployLib
    return metadata
  }

  async deployMetadataOf (contractName, fileLocation) {
    let path
    if (fileLocation) {
      path = fileLocation.split('/')
      path.pop()
      path = path.join('/')
    } else {
      try {
        path = this._extractPathOf(await this.call('fileManager', 'getCurrentFile'))
      } catch (err) {
        console.log(err)
        throw new Error(err)
      }
    }
    try {
      const { id, name } = await this.call('network', 'detectNetwork')
      const fileName = this._JSONFileName(path, contractName)
      try {
        const content = await this.call('fileManager', 'readFile', fileName)
        if (!content) return null
        let metadata = JSON.parse(content)
        metadata = metadata.deploy || {}
        return metadata[name + ':' + id] || metadata[name] || metadata[id] || metadata[name.toLowerCase() + ':' + id] || metadata[name.toLowerCase()]
      } catch (err) {
        return null
      }
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  joinPath (...paths) {
    paths = paths.filter((value) => value !== '').map((path) => path.replace(/^\/|\/$/g, '')) // remove first and last slash)
    if (paths.length === 1) return paths[0]
    return paths.join('/')
  }
}
