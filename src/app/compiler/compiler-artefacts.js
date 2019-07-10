'use strict'
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'
import CompilerAbstract from './compiler-abstract'

const profile = {
  name: 'compilerArtefacts',
  methods: [],
  events: [],
  version: packageJson.version
}

module.exports = class CompilerArtefacts extends Plugin {
  constructor () {
    super(profile)
    this.compilersArtefacts = {}
  }

  clear () {
    this.compilersArtefacts = {}
  }

  onActivation () {
    this.on('solidity', 'compilationFinished', (file, source, languageVersion, data) => {
      this.compilersArtefacts['__last'] = new CompilerAbstract(languageVersion, data, source)
    })

    this.on('vyper', 'compilationFinished', (file, source, languageVersion, data) => {
      this.compilersArtefacts['__last'] = new CompilerAbstract(languageVersion, data, source)
    })
  }
}
