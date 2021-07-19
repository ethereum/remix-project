'use strict'
import * as remixLib from '@remix-project/remix-lib'

const txHelper = remixLib.execution.txHelper

export class CompilerAbstract {
  public languageversion: string
  public data: Record<string, any>
  public source: Record<string, any>

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
    } else if (Object.keys(this.source.sources).length === 1) {
      // if we don't have ast, we return the only one filename present.
      const sourcesArray = Object.keys(this.source.sources)
      return sourcesArray[0]
    }
    return null
  }

  getSourceCode () {
    return this.source
  }
}
