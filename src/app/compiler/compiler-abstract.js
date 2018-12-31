'use strict'
var remixLib = require('remix-lib')
var txHelper = remixLib.execution.txHelper

module.exports = class CompilerAbstract {
  constructor (languageversion, data, source) {
    this.languageversion = languageversion
    this.data = data
    this.source = source // source code
  }

  getContracts () {
    return this.data.contracts
  }

  getContract (name) {
    return txHelper.getContract(name, this.data.contracts)
  }

  visitContracts (calllback) {
    return txHelper.visitContracts(this.data.contracts, calllback)
  }

  getData () {
    return this.data
  }

  getAsts () {
    return this.data.sources // ast
  }

  getSourceName (fileIndex) {
    if (this.data && this.data.sources) {
      return Object.keys(this.data.sources)[fileIndex]
    }
    return null
  }

  getSourceCode () {
    return this.source
  }
}
