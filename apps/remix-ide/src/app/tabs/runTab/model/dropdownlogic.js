const remixLib = require('@remix-project/remix-lib')
const txHelper = remixLib.execution.txHelper
const CompilerAbstract = require('../../../compiler/compiler-abstract')
const EventManager = remixLib.EventManager
const _paq = window._paq = window._paq || []

class DropdownLogic {
  constructor (compilersArtefacts, config, editor, runView) {
    this.compilersArtefacts = compilersArtefacts
    this.config = config
    this.editor = editor
    this.runView = runView

    this.event = new EventManager()

    this.listenToCompilationEvents()
  }

  // TODO: can be moved up; the event in contractDropdown will have to refactored a method instead
  listenToCompilationEvents () {
    const broadcastCompilationResult = (file, source, languageVersion, data) => {
      // TODO check whether the tab is configured
      const compiler = new CompilerAbstract(languageVersion, data, source)
      this.compilersArtefacts[languageVersion] = compiler
      this.compilersArtefacts.__last = compiler
      this.event.trigger('newlyCompiled', [true, data, source, compiler, languageVersion, file])
    }
    this.runView.on('solidity', 'compilationFinished', (file, source, languageVersion, data) =>
      broadcastCompilationResult(file, source, languageVersion, data)
    )
    this.runView.on('vyper', 'compilationFinished', (file, source, languageVersion, data) =>
      broadcastCompilationResult(file, source, languageVersion, data)
    )
    this.runView.on('lexon', 'compilationFinished', (file, source, languageVersion, data) =>
      broadcastCompilationResult(file, source, languageVersion, data)
    )
    this.runView.on('yulp', 'compilationFinished', (file, source, languageVersion, data) =>
      broadcastCompilationResult(file, source, languageVersion, data)
    )
    this.runView.on('optimism-compiler', 'compilationFinished', (file, source, languageVersion, data) =>
      broadcastCompilationResult(file, source, languageVersion, data)
    )
  }

  loadContractFromAddress (address, confirmCb, cb) {
    if (/.(.abi)$/.exec(this.config.get('currentFile'))) {
      confirmCb(() => {
        var abi
        try {
          abi = JSON.parse(this.editor.currentContent())
        } catch (e) {
          return cb('Failed to parse the current file as JSON ABI.')
        }
        _paq.push(['trackEvent', 'udapp', 'AtAddressLoadWithABI'])
        cb(null, 'abi', abi)
      })
    } else {
      _paq.push(['trackEvent', 'udapp', 'AtAddressLoadWithInstance'])
      cb(null, 'instance')
    }
  }

  getCompiledContracts (compiler, compilerFullName) {
    var contracts = []
    compiler.visitContracts((contract) => {
      contracts.push(contract)
    })
    return contracts
  }

  getSelectedContract (contractName, compilerAtributeName) {
    if (!contractName) return null

    var compiler = this.compilersArtefacts[compilerAtributeName]
    if (!compiler) return null

    var contract = compiler.getContract(contractName)

    return {
      name: contractName,
      contract: contract,
      compiler: compiler,
      abi: contract.object.abi,
      bytecodeObject: contract.object.evm.bytecode.object,
      bytecodeLinkReferences: contract.object.evm.bytecode.linkReferences,
      object: contract.object,
      deployedBytecode: contract.object.evm.deployedBytecode,
      getConstructorInterface: () => {
        return txHelper.getConstructorInterface(contract.object.abi)
      },
      getConstructorInputs: () => {
        var constructorInteface = txHelper.getConstructorInterface(contract.object.abi)
        return txHelper.inputParametersDeclarationToString(constructorInteface.inputs)
      },
      isOverSizeLimit: () => {
        var deployedBytecode = contract.object.evm.deployedBytecode
        return (deployedBytecode && deployedBytecode.object.length / 2 > 24576)
      },
      metadata: contract.object.metadata
    }
  }

  getCompilerContracts () {
    return this.compilersArtefacts.__last.getData().contracts
  }
}

module.exports = DropdownLogic
