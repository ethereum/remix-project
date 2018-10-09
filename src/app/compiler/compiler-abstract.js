'use strict'
var remixLib = require('remix-lib')
var txHelper = remixLib.execution.txHelper

module.exports = class CompilerAbstract {
  constructor (languageversion, data) {
    this.languageversion = languageversion
    this.data = data
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
}
