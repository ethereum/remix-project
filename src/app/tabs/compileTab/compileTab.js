const async = require('async')
const EventEmitter = require('events')
var remixTests = require('remix-tests')
var Compiler = require('remix-solidity').Compiler
var CompilerImport = require('../../compiler/compiler-imports')

// TODO: move this to the UI
const addTooltip = require('../../ui/tooltip')

class CompileTab {

  constructor (queryParams, fileManager, editor, config, fileProvider) {
    this.event = new EventEmitter()
    this.queryParams = queryParams
    this.compilerImport = new CompilerImport()
    this.compiler = new Compiler((url, cb) => this.importFileCb(url, cb))
    console.log('This is compiler object bro-1-->', this.compiler)
    this.fileManager = fileManager
    this.editor = editor
    this.config = config
    this.fileProvider = fileProvider
  }

  init () {
    this.optimize = this.queryParams.get().optimize
    this.optimize = this.optimize === 'true'
    this.queryParams.update({ optimize: this.optimize })
    this.compiler.set('optimize', this.optimize)

    this.evmVersion = this.queryParams.get().evmVersion
    if (this.evmVersion === 'undefined' || this.evmVersion === 'null' || !this.evmVersion) {
      this.evmVersion = null
    }
    this.queryParams.update({ evmVersion: this.evmVersion })
    this.compiler.set('evmVersion', this.evmVersion)
  }

  setOptimize (newOptimizeValue) {
    this.optimize = newOptimizeValue
    this.queryParams.update({ optimize: this.optimize })
    this.compiler.set('optimize', this.optimize)
    console.log('This is compiler object bro--2->', this.compiler)
  }

  setEvmVersion (newEvmVersion) {
    this.evmVersion = newEvmVersion
    this.queryParams.update({ evmVersion: this.evmVersion })
    this.compiler.set('evmVersion', this.evmVersion)
    console.log('This is compiler object bro--3->', this.compiler)
  }

  /**
   * Set the compiler to using Solidity or Yul (default to Solidity)
   * @params lang {'Solidity' | 'Yul'} ...
   */
  setLanguage (lang) {
    this.compiler.set('language', lang)
  }

  /**
   * Compile a specific file of the file manager
   * @param {string} target the path to the file to compile
   */
  compileFile (target) {
    if (!target) throw new Error('No target provided for compiliation')
    const provider = this.fileManager.fileProviderOf(target)
    if (!provider) throw new Error(`cannot compile ${target}. Does not belong to any explorer`)
    return new Promise((resolve, reject) => {
      provider.get(target, (error, content) => {
        if (error) return reject(error)
        const sources = { [target]: { content } }
        this.event.emit('startingCompilation')
        // setTimeout fix the animation on chrome... (animation triggered by 'staringCompilation')
        setTimeout(() => this.compiler.compile(sources, target), 100)
      })
    })
  }

  runCompiler () {
    try {
      this.fileManager.saveCurrentFile()
      this.editor.clearAnnotations()
      var currentFile = this.config.get('currentFile')
      return this.compileFile(currentFile)
    } catch (err) {
      console.error(err)
    }
  }

  importExternal (url, cb) {
    this.compilerImport.import(url,

      // TODO: move to an event that is generated, the UI shouldn't be here
      (loadingMsg) => { addTooltip(loadingMsg) },
      (error, content, cleanUrl, type, url) => {
        if (error) return cb(error)

        if (this.fileProvider) {
          this.fileProvider.addExternal(type + '/' + cleanUrl, content, url)
        }
        cb(null, content)
      })
  }

  importFileCb (url, filecb) {
    if (url.indexOf('remix_tests.sol') !== -1) return filecb(null, remixTests.assertLibCode)

    var provider = this.fileManager.fileProviderOf(url)
    if (provider) {
      if (provider.type === 'localhost' && !provider.isConnected()) {
        return filecb(`file provider ${provider.type} not available while trying to resolve ${url}`)
      }
      return provider.exists(url, (error, exist) => {
        if (error) return filecb(error)
        if (exist) {
          return provider.get(url, filecb)
        }
        this.importExternal(url, filecb)
      })
    }
    if (this.compilerImport.isRelativeImport(url)) {
      // try to resolve localhost modules (aka truffle imports)
      var splitted = /([^/]+)\/(.*)$/g.exec(url)
      return async.tryEach([
        (cb) => { this.importFileCb('localhost/installed_contracts/' + url, cb) },
        (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.importFileCb('localhost/installed_contracts/' + splitted[1] + '/contracts/' + splitted[2], cb) } },
        (cb) => { this.importFileCb('localhost/node_modules/' + url, cb) },
        (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.importFileCb('localhost/node_modules/' + splitted[1] + '/contracts/' + splitted[2], cb) } }],
        (error, result) => { filecb(error, result) }
      )
    }
    this.importExternal(url, filecb)
  }

}

module.exports = CompileTab
