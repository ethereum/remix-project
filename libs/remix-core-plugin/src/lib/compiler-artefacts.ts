'use strict'
import { Plugin } from '@remixproject/engine'
import { CompilerAbstract } from '@remix-project/remix-solidity'

const profile = {
  name: 'compilerArtefacts',
  methods: ['get', 'addResolvedContract', 'getCompilerAbstract', 'getAllContractDatas', 'getLastCompilationResult'],
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
