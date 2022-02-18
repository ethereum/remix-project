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

  async getArtefactsFromFE (path, contractName) {
    const dirList = await this.call('fileManager', 'dirList', path)
    if(dirList && dirList.length) {
      if(dirList.includes(path + '/artifacts')) {
        const fileList = await this.call('fileManager', 'fileList', path + '/artifacts')
        const artefactsFilePaths = fileList.filter(filePath => {
          const filenameArr = filePath.split('/')
          const filename = filenameArr[filenameArr.length - 1]
          if (filename === `${contractName}_fullOP.json`) return true
        })
        if (artefactsFilePaths && artefactsFilePaths.length) {
          const content = await this.call('fileManager', 'readFile', artefactsFilePaths[0])
          const artifacts = JSON.parse(content)
          return artifacts
        } else {
          for (const dirPath of dirList) {
            const result = await this.getArtefactsFromFE (dirPath, contractName)
            if (result) return result
          }
        }
      } else {
        for (const dirPath of dirList) {
          const result = await this.getArtefactsFromFE (dirPath, contractName)
          if (result) return result
        }
      }
    } else return
  }

  async getArtefactsByContractName (contractName) {
    const contractsDataByFilename = this.getAllContractDatas()
    const contractsData = Object.values(contractsDataByFilename)
    if (contractsData && contractsData.length) {
      const index = contractsData.findIndex((contractsObj) => Object.keys(contractsObj).includes(contractName))
      if (index !== -1) return contractsData[index][contractName]
      else {
        const result = await this.getArtefactsFromFE ('contracts', contractName)
        if (result) return result
        else throw new Error(`Could not find artifacts for ${contractName}. Compile contract to generate artifacts.`)
      }
    } else {
      const result = await this.getArtefactsFromFE ('contracts', contractName)
      if (result) return result
      else throw new Error(`Could not find artifacts for ${contractName}. Compile contract to generate artifacts.`)
    }  
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
