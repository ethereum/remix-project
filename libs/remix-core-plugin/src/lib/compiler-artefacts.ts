'use strict'
import { Plugin } from '@remixproject/engine'
import { CompilerAbstract } from '@remix-project/remix-solidity'

const profile = {
  name: 'compilerArtefacts',
  methods: ['get', 'addResolvedContract', 'getCompilerAbstract', 'getAllContractDatas', 'getLastCompilationResult', 'getArtefactsByContractName'],
  events: [],
  version: '0.0.1'
}

export class CompilerArtefacts extends Plugin {
  compilersArtefactsPerFile: any
  compilersArtefacts: any
  constructor () {
    super(profile)
    this.compilersArtefacts = {}
    this.compilersArtefactsPerFile = {}
  }

  clear () {
    this.compilersArtefacts = {}
    this.compilersArtefactsPerFile = {}
  }

  onActivation () {
    const saveCompilationPerFileResult = (file, source, languageVersion, data) => {
      this.compilersArtefactsPerFile[file] = new CompilerAbstract(languageVersion, data, source)
    }

    this.on('solidity', 'compilationFinished', (file, source, languageVersion, data) => {
      this.compilersArtefacts.__last = new CompilerAbstract(languageVersion, data, source)
      saveCompilationPerFileResult(file, source, languageVersion, data)
    })

    this.on('vyper', 'compilationFinished', (file, source, languageVersion, data) => {
      this.compilersArtefacts.__last = new CompilerAbstract(languageVersion, data, source)
      saveCompilationPerFileResult(file, source, languageVersion, data)
    })

    this.on('lexon', 'compilationFinished', (file, source, languageVersion, data) => {
      this.compilersArtefacts.__last = new CompilerAbstract(languageVersion, data, source)
      saveCompilationPerFileResult(file, source, languageVersion, data)
    })

    this.on('yulp', 'compilationFinished', (file, source, languageVersion, data) => {
      this.compilersArtefacts.__last = new CompilerAbstract(languageVersion, data, source)
      saveCompilationPerFileResult(file, source, languageVersion, data)
    })

    this.on('solidityUnitTesting', 'compilationFinished', (file, source, languageVersion, data) => {
      this.compilersArtefacts.__last = new CompilerAbstract(languageVersion, data, source)
      saveCompilationPerFileResult(file, source, languageVersion, data)
    })
  }

  getLastCompilationResult () {
    return this.compilersArtefacts.__last
  }

  getAllContractDatas () {
    const contractsData = {}
    Object.keys(this.compilersArtefactsPerFile).map((targetFile) => {
      const contracts = this.compilersArtefactsPerFile[targetFile].getContracts()
      Object.keys(contracts).map((file) => { contractsData[file] = contracts[file] })
    })
    // making sure we save last compilation result in there
    if (this.compilersArtefacts.__last) {
      const contracts = this.compilersArtefacts.__last.getContracts()
      Object.keys(contracts).map((file) => { contractsData[file] = contracts[file] })
    }
    return contractsData
  }

  getAllContractArtefactsfromOutput (contractsOutput, contractName) {
    const contractArtefacts = {}
    for (const filename in contractsOutput) {
      if(Object.keys(contractsOutput[filename]).includes(contractName)) contractArtefacts[filename + ':' + contractName] = contractsOutput[filename][contractName]
    }
    return contractArtefacts
  }

  async getArtefactsFromFE (path, contractName, contractArtefacts) {
    const dirList = await this.call('fileManager', 'dirList', path)
    if(dirList && dirList.length) {
      for (const dirPath of dirList) {
        if(dirPath === path + '/artifacts' && await this.call('fileManager', 'exists', dirPath + '/build-info')) {
          const buildFileList = await this.call('fileManager', 'fileList', dirPath + '/build-info')
          for (const buildFile of buildFileList) {
            let content = await this.call('fileManager', 'readFile', buildFile)
            if (content) content = JSON.parse(content)
            const contracts = content.output.contracts
            const artefacts = this.getAllContractArtefactsfromOutput(contracts, contractName)
            Object.assign(contractArtefacts, artefacts)
          }
      } else await this.getArtefactsFromFE (dirPath, contractName, contractArtefacts)
    } 
  } else return
}

  async getArtefactsByContractName (contractName) {
    const contractsDataByFilename = this.getAllContractDatas()
    // let contractArtefacts
    const  contractArtefacts = this.getAllContractArtefactsfromOutput(contractsDataByFilename, contractName)
    let keys = Object.keys(contractArtefacts)
    if (!keys.length) {
      await this.getArtefactsFromFE ('contracts', contractName, contractArtefacts)
      keys = Object.keys(contractArtefacts)
    }
    if (keys.length === 1) return contractArtefacts[keys[0]]
    else if (keys.length > 1) {
      throw new Error(`There are multiple artifacts for contract "${contractName}", please use a fully qualified name.\n
        Please replace ${contractName} for one of these options wherever you are trying to read its artifact: \n
        ${keys.join()}\n
        OR just compile the required contract again`)
    } else throw new Error(`Could not find artifacts for ${contractName}. Compile contract to generate artifacts.`)
  }

  getCompilerAbstract (file) {
    return this.compilersArtefactsPerFile[file]
  }

  // compilerData is a CompilerAbstract object
  addResolvedContract (address, compilerData) {
    this.compilersArtefacts[address] = compilerData
  }

  isResolved (address) {
    return this.compilersArtefacts[address] !== undefined
  }

  get (key) {
    return this.compilersArtefacts[key]
  }
}
