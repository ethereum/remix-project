'use strict'
import { Plugin } from '@remixproject/engine'
import { util } from '@remix-project/remix-lib'
import { CompilerAbstract } from '@remix-project/remix-solidity'

const profile = {
  name: 'compilerArtifacts',
  methods: ['get', 'addResolvedContract', 'getCompilerAbstract', 'getAllContractDatas', 'getLastCompilationResult', 'getArtifactsByContractName', 'getContractDataFromAddress', 'getContractDataFromByteCode', 'saveCompilerAbstract', 'getAllCompilerAbstracts'],
  events: ['compilationSaved'],
  version: '0.0.1',
}

export class CompilerArtifacts extends Plugin {
  compilersArtifactsPerFile: any
  compilersArtifacts: any
  constructor() {
    super(profile)
    this.compilersArtifacts = {}
    this.compilersArtifactsPerFile = {}
  }

  clear() {
    this.compilersArtifacts = {}
    this.compilersArtifactsPerFile = {}
  }

  saveCompilerAbstract(file: string, compilerAbstract: CompilerAbstract) {
    this.compilersArtifactsPerFile[file] = compilerAbstract
  }

  getAllCompilerAbstracts() {
    return this.compilersArtifactsPerFile
  }

  onActivation() {
    const saveCompilationResult = (file, source, languageVersion, data, input?) => {
      this.compilersArtifactsPerFile[file] = new CompilerAbstract(languageVersion, data, source, input)
      this.compilersArtifacts.__last = this.compilersArtifactsPerFile[file]
      this.emit('compilationSaved', { [file]: this.compilersArtifactsPerFile[file] })
    }

    this.on('solidity', 'compilationFinished', saveCompilationResult)

    this.on('vyper', 'compilationFinished', saveCompilationResult)

    this.on('lexon', 'compilationFinished', saveCompilationResult)

    this.on('yulp', 'compilationFinished', saveCompilationResult)

    this.on('solidityUnitTesting', 'compilationFinished', saveCompilationResult)

    this.on('nahmii-compiler', 'compilationFinished', saveCompilationResult)

    this.on('hardhat', 'compilationFinished', saveCompilationResult)

    this.on('truffle', 'compilationFinished', saveCompilationResult)

    this.on('foundry', 'compilationFinished', saveCompilationResult)
  }

  /**
   * Get artifacts for last compiled contract
   * * @returns last compiled contract compiler abstract
   */
  getLastCompilationResult() {
    return this.compilersArtifacts.__last
  }

  /**
   * Get compilation output for contracts compiled during a session of Remix IDE
   * @returns compilation output
   */
  getAllContractDatas() {
    return this.filterAllContractDatas(() => true)
  }

  /**
   * filter compilation output for contracts compiled during a session of Remix IDE
   * @returns compilation output
   */
  filterAllContractDatas(filter) {
    const contractsData = {}
    Object.keys(this.compilersArtifactsPerFile).map((targetFile) => {
      const artifact = this.compilersArtifactsPerFile[targetFile]
      const contracts = artifact.getContracts()
      Object.keys(contracts).map((file) => {
        if (filter(file, contracts[file], artifact)) contractsData[file] = contracts[file]
      })
    })
    // making sure we save last compilation result in there
    if (this.compilersArtifacts.__last) {
      const contracts = this.compilersArtifacts.__last.getContracts()
      Object.keys(contracts).map((file) => {
        if (filter(file, contracts[file], this.compilersArtifacts.__last)) contractsData[file] = contracts[file]
      })
    }
    return contractsData
  }

  /**
   * Get a particular contract output/artifacts from a compiler output of a Solidity file compilation
   * @param compilerOutput compiler output
   * @param contractName contract name
   * @returns artifacts object, with fully qualified name (e.g; contracts/1_Storage.sol:Storage) as key
   */
  _getAllContractArtifactsfromOutput(compilerOutput, contractName) {
    const contractArtifacts = {}
    for (const filename in compilerOutput) {
      if (Object.keys(compilerOutput[filename]).includes(contractName)) contractArtifacts[filename + ':' + contractName] = compilerOutput[filename][contractName]
    }
    return contractArtifacts
  }

  /**
   * Populate resultant object with a particular contract output/artifacts by processing all the artifacts stored in file explorer
   * @param path path to start looking from
   * @param contractName contract to be looked for
   * @param contractArtifacts populated resultant artifacts object, with fully qualified name (e.g: contracts/1_Storage.sol:Storage) as key
   * Once method execution completes, contractArtifacts object will hold all possible artifacts for contract
   */
  async _populateAllContractArtifactsFromFE(path, contractName, contractArtifacts) {
    const dirList = await this.call('fileManager', 'dirList', path)
    if (dirList && dirList.length) {
      for (const dirPath of dirList) {
        // check if directory contains an 'artifacts' folder and a 'build-info' folder inside 'artifacts'
        if (dirPath === path + '/artifacts' && (await this.call('fileManager', 'exists', dirPath + '/build-info'))) {
          const buildFileList = await this.call('fileManager', 'fileList', dirPath + '/build-info')
          // process each build-info file to populate the artifacts for contractName
          for (const buildFile of buildFileList) {
            let content = await this.call('fileManager', 'readFile', buildFile)
            if (content) content = JSON.parse(content)
            const compilerOutput = content.output.contracts
            const artifacts = this._getAllContractArtifactsfromOutput(compilerOutput, contractName)
            // populate the resultant object with artifacts
            Object.assign(contractArtifacts, artifacts)
          }
        } else await this._populateAllContractArtifactsFromFE(dirPath, contractName, contractArtifacts)
      }
    } else return
  }

  /**
   * Get artifacts for a contract (called by script-runner)
   * @param name contract name or fully qualified name i.e. <filename>:<contractname> e.g: contracts/1_Storage.sol:Storage
   * @returns artifacts for the contract
   */
  async getArtifactsByContractName(name) {
    const contractsDataByFilename = this.getAllContractDatas()
    // check if name is a fully qualified name
    if (name.includes(':')) {
      const fullyQualifiedName = name
      const nameArr = fullyQualifiedName.split(':')
      const filename = nameArr[0]
      const contract = nameArr[1]
      if (Object.keys(contractsDataByFilename).includes(filename) && contractsDataByFilename[filename][contract]) return contractsDataByFilename[filename][contract]
      else {
        const allContractsData = {}
        await this._populateAllContractArtifactsFromFE('contracts', contract, allContractsData)
        if (allContractsData[fullyQualifiedName]) return { fullyQualifiedName, artifact: allContractsData[fullyQualifiedName] }
        else throw new Error(`Could not find artifacts for ${fullyQualifiedName}. Compile contract to generate artifacts.`)
      }
    } else {
      const contractName = name
      const contractArtifacts = this._getAllContractArtifactsfromOutput(contractsDataByFilename, contractName)
      let keys = Object.keys(contractArtifacts)
      if (!keys.length) {
        await this._populateAllContractArtifactsFromFE('contracts', contractName, contractArtifacts)
        keys = Object.keys(contractArtifacts)
      }
      if (keys.length === 1) return { fullyQualifiedName: keys[0], artifact: contractArtifacts[keys[0]] }
      else if (keys.length > 1) {
        throw new Error(`There are multiple artifacts for contract "${contractName}", please use a fully qualified name.\n
          Please replace ${contractName} for one of these options wherever you are trying to read its artifact: \n
          ${keys.join()}\n
          OR just compile the required contract again`)
      } else throw new Error(`Could not find artifacts for ${contractName}. Compile contract to generate artifacts.`)
    }
  }

  async getCompilerAbstract(file) {
    if (!file) return null
    if (this.compilersArtifactsPerFile[file]) return this.compilersArtifactsPerFile[file]
    const path = await this.call('fileManager', 'getPathFromUrl', file)

    if (path && path.file && this.compilersArtifactsPerFile[path.file]) return this.compilersArtifactsPerFile[path.file]

    let artifact = null
    this.filterAllContractDatas((localFile, data, parentArtifact) => {
      if (localFile === file || (path && path.file && localFile === path.file)) {
        artifact = parentArtifact
      }
    })
    return artifact
  }

  addResolvedContract(address: string, compilerData: CompilerAbstract) {
    this.compilersArtifacts[address] = compilerData
  }

  isResolved(address) {
    return this.compilersArtifacts[address] !== undefined
  }

  get(key) {
    return this.compilersArtifacts[key]
  }

  async getContractDataFromAddress(address) {
    const code = await this.call('blockchain', 'getCode', address)
    return this.getContractDataFromByteCode(code)
  }

  async getContractDataFromByteCode(code) {
    let found
    this.filterAllContractDatas((file, contractsData) => {
      for (const name of Object.keys(contractsData)) {
        const contract = contractsData[name]
        if (util.compareByteCode(code, '0x' + contract.evm.deployedBytecode.object)) {
          found = { name, contract, file }
          return true
        }
      }
      return true
    })
    return found
  }
}