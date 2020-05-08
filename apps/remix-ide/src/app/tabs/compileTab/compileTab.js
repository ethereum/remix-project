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
  }

  setEvmVersion (newEvmVersion) {
    this.evmVersion = newEvmVersion
    this.queryParams.update({ evmVersion: this.evmVersion })
    this.compiler.set('evmVersion', this.evmVersion)
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

  /**
    * import the content of @arg url.
    * first look in the browser localstorage (browser explorer) or locahost explorer. if the url start with `browser/*` or  `localhost/*`
    * then check if the @arg url is located in the localhost, in the node_modules or installed_contracts folder
    * then check if the @arg url match any external url
    *
    * @param {String} url  - URL of the content. can be basically anything like file located in the browser explorer, in the localhost explorer, raw HTTP, github address etc...
    * @param {Function} cb  - callback
    */
  importFileCb (url, filecb) {
    if (url.indexOf('remix_tests.sol') !== -1) return filecb(null, remixTests.assertLibCode)

    var provider = this.fileManager.fileProviderOf(url)
    if (provider) {
      if (provider.type === 'localhost' && !provider.isConnected()) {
        return filecb(`file provider ${provider.type} not available while trying to resolve ${url}`)
      }
      provider.exists(url, (error, exist) => {
        if (error) return filecb(error)
        if (!exist && provider.type === 'localhost') return filecb(`not found ${url}`)

        /*
          if the path is absolute and the file does not exist, we can stop here
          Doesn't make sense to try to resolve "localhost/node_modules/localhost/node_modules/<path>" and we'll end in an infinite loop.
        */
        if (!exist && url.startsWith('browser/')) return filecb(`not found ${url}`)
        if (!exist && url.startsWith('localhost/')) return filecb(`not found ${url}`)

        if (exist) return provider.get(url, filecb)

        // try to resolve localhost modules (aka truffle imports) - e.g from the node_modules folder
        const localhostProvider = this.fileManager.getProvider('localhost')
        if (localhostProvider.isConnected()) {
          var splitted = /([^/]+)\/(.*)$/g.exec(url)
          return async.tryEach([
            (cb) => { this.importFileCb('localhost/installed_contracts/' + url, cb) },
            (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.importFileCb('localhost/installed_contracts/' + splitted[1] + '/contracts/' + splitted[2], cb) } },
            (cb) => { this.importFileCb('localhost/node_modules/' + url, cb) },
            (cb) => { if (!splitted) { cb('URL not parseable: ' + url) } else { this.importFileCb('localhost/node_modules/' + splitted[1] + '/contracts/' + splitted[2], cb) } }],
            (error, result) => {
              if (error) return this.importExternal(url, filecb)
              filecb(null, result)
            }
          )
        } else {
          // try to resolve external content
          this.importExternal(url, filecb)
        }
      })
    }
  }

}

module.exports = CompileTab
