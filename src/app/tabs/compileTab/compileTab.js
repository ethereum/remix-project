const async = require('async')
const EventEmitter = require('events')
var remixTests = require('remix-tests')
var Compiler = require('remix-solidity').Compiler
var CompilerImport = require('../../compiler/compiler-imports')

// TODO: move this to the UI
const addTooltip = require('../../ui/tooltip')

class CompileTab {

  constructor (queryParams, fileManager, editor, config, fileProviders) {
    this.event = new EventEmitter()
    this.queryParams = queryParams
    this.compilerImport = new CompilerImport()
    this.compiler = new Compiler((url, cb) => this.importFileCb(url, cb))
    this.fileManager = fileManager
    this.editor = editor
    this.config = config
    this.fileProviders = fileProviders
  }

  init () {
    this.optimize = this.queryParams.get().optimize
    this.optimize = this.optimize === 'true'
    this.queryParams.update({ optimize: this.optimize })
    this.compiler.setOptimize(this.optimize)
  }

  setOptimize (newOptimizeValue) {
    this.optimize = newOptimizeValue
    this.queryParams.update({ optimize: this.optimize })
    this.compiler.setOptimize(this.optimize)
  }

  runCompiler () {
    this.fileManager.saveCurrentFile()
    this.editor.clearAnnotations()
    var currentFile = this.config.get('currentFile')
    if (!currentFile) return
    if (!/\.sol/.exec(currentFile)) return
    // only compile *.sol file.
    var target = currentFile
    var sources = {}
    var provider = this.fileManager.fileProviderOf(currentFile)
    if (!provider) return console.log('cannot compile ' + currentFile + '. Does not belong to any explorer')
    provider.get(target, (error, content) => {
      if (error) return console.log(error)
      sources[target] = { content }
      this.event.emit('startingCompilation')
      setTimeout(() => {
        // setTimeout fix the animation on chrome... (animation triggered by 'staringCompilation')
        this.compiler.compile(sources, target)
      }, 100)
    })
  }

  importExternal (url, cb) {
    this.compilerImport.import(url,

      // TODO: move to an event that is generated, the UI shouldn't be here
      (loadingMsg) => { addTooltip(loadingMsg) },
      (error, content, cleanUrl, type, url) => {
        if (error) return cb(error)

        if (this.fileProviders[type]) {
          this.fileProviders[type].addReadOnly(cleanUrl, content, url)
        }
        cb(null, content)
      })
  }

  importFileCb (url, filecb) {
    if (url.indexOf('/remix_tests.sol') !== -1) return filecb(null, remixTests.assertLibCode)

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
