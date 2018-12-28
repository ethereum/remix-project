var ethJSUtil = require('ethereumjs-util')
var remixLib = require('remix-lib')
var CompilerAbstract = require('../../../compiler/compiler-abstract')
var EventManager = remixLib.EventManager

class DropdownLogic {
  constructor (parentSelf) {
    this.parentSelf = parentSelf
    this.event = new EventManager()

    this.listenToCompilationEvents()

    this.parentSelf._deps.fileManager.event.register('currentFileChanged', (currentFile) => {
      this.event.trigger('currentFileChanged', [currentFile])
    })
  }

  listenToCompilationEvents () {
    this.parentSelf._deps.pluginManager.event.register('sendCompilationResult', (file, source, languageVersion, data) => {
      // TODO check whether the tab is configured
      let compiler = new CompilerAbstract(languageVersion, data)
      this.parentSelf._deps.compilersArtefacts[languageVersion] = compiler
      this.parentSelf._deps.compilersArtefacts['__last'] = compiler
      this.event.trigger('newlyCompiled', [true, data, source, compiler, languageVersion])
    })

    this.parentSelf._deps.compiler.event.register('compilationFinished', (success, data, source) => {
      var name = 'solidity'
      let compiler = new CompilerAbstract(name, data)
      this.parentSelf._deps.compilersArtefacts[name] = compiler
      this.parentSelf._deps.compilersArtefacts['__last'] = compiler
      this.event.trigger('newlyCompiled', [success, data, source, this.parentSelf._deps.compiler, name])
    })
  }

  loadContractFromAddress (address, confirmCb, cb) {
    if (!ethJSUtil.isValidAddress(address)) {
      return cb('Invalid address.')
    }
    if (/[a-f]/.test(address) && /[A-F]/.test(address) && !ethJSUtil.isValidChecksumAddress(address)) {
      return cb('Invalid checksum address.')
    }
    if (/.(.abi)$/.exec(this.parentSelf._deps.config.get('currentFile'))) {
      confirmCb(() => {
        var abi
        try {
          abi = JSON.parse(this.parentSelf._deps.editor.currentContent())
        } catch (e) {
          return cb('Failed to parse the current file as JSON ABI.')
        }
        cb(null, 'abi', abi)
      })
    }
    cb(null, 'instance')
  }

  getCompiledContracts (compiler, compilerFullName) {
    var contracts = []
    compiler.visitContracts((contract) => {
      contracts.push(contract)
    })
    return contracts
  }

  getContractCompiler (name) {
    return this.parentSelf._deps.compilersArtefacts[name]
  }
}

module.exports = DropdownLogic
