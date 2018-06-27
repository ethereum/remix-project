'use strict'

var $ = require('jquery')
var csjs = require('csjs-inject')
var yo = require('yo-yo')
var async = require('async')
var request = require('request')
var remixLib = require('remix-lib')
var remixTests = require('remix-tests')
var EventManager = remixLib.EventManager

var registry = require('./global/registry')
var UniversalDApp = require('./universal-dapp.js')
var UniversalDAppUI = require('./universal-dapp-ui.js')
var Remixd = require('./lib/remixd')
var OffsetToLineColumnConverter = require('./lib/offsetToLineColumnConverter')

var QueryParams = require('./lib/query-params')
var GistHandler = require('./lib/gist-handler')
var helper = require('./lib/helper')
var Storage = remixLib.Storage
var Browserfiles = require('./app/files/browser-files')
var BrowserfilesTree = require('./app/files/browser-files-tree')
var chromeCloudStorageSync = require('./app/files/chromeCloudStorageSync')
var SharedFolder = require('./app/files/shared-folder')
var Config = require('./config')
var Editor = require('./app/editor/editor')
var Renderer = require('./app/ui/renderer')
var Compiler = require('remix-solidity').Compiler
var executionContext = require('./execution-context')
var Debugger = require('./app/debugger/debugger')
var StaticAnalysis = require('./app/staticanalysis/staticAnalysisView')
var FilePanel = require('./app/panels/file-panel')
var EditorPanel = require('./app/panels/editor-panel')
var RighthandPanel = require('./app/panels/righthand-panel')
var examples = require('./app/editor/example-contracts')
var modalDialogCustom = require('./app/ui/modal-dialog-custom')
var TxLogger = require('./app/execution/txLogger')
var Txlistener = remixLib.execution.txListener
var EventsDecoder = remixLib.execution.EventsDecoder
var CompilerImport = require('./app/compiler/compiler-imports')
var FileManager = require('./app/files/fileManager')
var ContextualListener = require('./app/editor/contextualListener')
var ContextView = require('./app/editor/contextView')
var BasicReadOnlyExplorer = require('./app/files/basicReadOnlyExplorer')
var NotPersistedExplorer = require('./app/files/NotPersistedExplorer')
var toolTip = require('./app/ui/tooltip')
var CommandInterpreter = require('./lib/cmdInterpreter')
var TransactionReceiptResolver = require('./transactionReceiptResolver')

var styleGuide = require('./app/ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  html { box-sizing: border-box; }
  *, *:before, *:after { box-sizing: inherit; }
  body                 {
    font: 14px/1.5 Lato, "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin             : 0;
    padding            : 0;
    font-size          : 12px;
    color              : ${styles.leftPanel.text_Primary};
    font-weight        : normal;
  }
  pre {
    overflow-x: auto;
  }
  .browsersolidity     {
    position           : relative;
    width              : 100vw;
    height             : 100vh;
    overflow           : hidden;
  }
  .centerpanel         {
    background-color  : ${styles.colors.transparent};
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    overflow           : hidden;
  }
  .leftpanel           {
    background-color  : ${styles.leftPanel.backgroundColor_Panel};
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    left               : 0;
    overflow           : hidden;
  }
  .rightpanel          {
    background-color  : ${styles.rightPanel.backgroundColor_Panel};
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    right              : 0;
    bottom             : 0;
    overflow           : hidden;
  }
  .highlightcode {
    position:absolute;
    z-index:20;
    background-color: ${styles.editor.backgroundColor_DebuggerMode};
  }
  .highlightcode_fullLine {
    position:absolute;
    z-index:20;
    background-color: ${styles.editor.backgroundColor_DebuggerMode};
    opacity: 0.5;
  }
`

class App {
  constructor (api = {}, events = {}, opts = {}) {
    var self = this
    self._api = {}
    registry.put({api: self, name: 'app'})
    var fileStorage = new Storage('sol:')
    registry.put({api: fileStorage, name: 'fileStorage'})

    var configStorage = new Storage('config:')
    registry.put({api: configStorage, name: 'configStorage'})

    self._api.config = new Config(fileStorage)
    registry.put({api: self._api.config, name: 'config'})

    executionContext.init(self._api.config)
    executionContext.listenOnLastBlock()
    self._api.filesProviders = {}
    self._api.filesProviders['browser'] = new Browserfiles(fileStorage)
    self._api.filesProviders['config'] = new BrowserfilesTree('config', configStorage)
    self._api.filesProviders['config'].init()
    registry.put({api: self._api.filesProviders['browser'], name: 'fileproviders/browser'})
    registry.put({api: self._api.filesProviders['config'], name: 'fileproviders/config'})
    var remixd = new Remixd()
    registry.put({api: remixd, name: 'remixd/config'})
    remixd.event.register('system', (message) => {
      if (message.error) toolTip(message.error)
    })
    self._api.filesProviders['localhost'] = new SharedFolder(remixd)
    self._api.filesProviders['swarm'] = new BasicReadOnlyExplorer('swarm')
    self._api.filesProviders['github'] = new BasicReadOnlyExplorer('github')
    self._api.filesProviders['gist'] = new NotPersistedExplorer('gist')
    self._api.filesProviders['ipfs'] = new BasicReadOnlyExplorer('ipfs')
    registry.put({api: self._api.filesProviders['localhost'], name: 'fileproviders/localhost'})
    registry.put({api: self._api.filesProviders['swarm'], name: 'fileproviders/swarm'})
    registry.put({api: self._api.filesProviders['github'], name: 'fileproviders/github'})
    registry.put({api: self._api.filesProviders['gist'], name: 'fileproviders/gist'})
    registry.put({api: self._api.filesProviders['ipfs'], name: 'fileproviders/ipfs'})
    registry.put({api: self._api.filesProviders, name: 'fileproviders'})
    self._view = {}
    self._components = {}
    self._components.compilerImport = new CompilerImport()
    registry.put({api: self._components.compilerImport, name: 'compilerimport'})
    self.data = {
      _layout: {
        right: {
          offset: self._api.config.get('right-offset') || 400,
          show: true
        }, // @TODO: adapt sizes proportionally to browser window size
        left: {
          offset: self._api.config.get('left-offset') || 200,
          show: true
        }
      }
    }
  }
  _adjustLayout (direction, delta) {
    var self = this
    var layout = self.data._layout[direction]
    if (layout) {
      if (delta === undefined) {
        layout.show = !layout.show
        if (layout.show) delta = layout.offset
        else delta = 0
      } else {
        self._api.config.set(`${direction}-offset`, delta)
        layout.offset = delta
      }
    }
    if (direction === 'left') {
      self._view.leftpanel.style.width = delta + 'px'
      self._view.centerpanel.style.left = delta + 'px'
    }
    if (direction === 'right') {
      self._view.rightpanel.style.width = delta + 'px'
      self._view.centerpanel.style.right = delta + 'px'
    }
  }
  init () {
    var self = this
    run.apply(self)
  }
  render () {
    var self = this
    if (self._view.el) return self._view.el
    self._view.leftpanel = yo`
      <div id="filepanel" class=${css.leftpanel}>
        ${''}
      </div>
    `
    self._view.centerpanel = yo`
      <div id="editor-container" class=${css.centerpanel}>
        ${''}
      </div>
    `
    self._view.rightpanel = yo`
      <div class=${css.rightpanel}>
        ${''}
      </div>
    `
    self._view.el = yo`
      <div class=${css.browsersolidity}>
        ${self._view.leftpanel}
        ${self._view.centerpanel}
        ${self._view.rightpanel}
      </div>
    `
    // INIT
    self._adjustLayout('left', self.data._layout.left.offset)
    self._adjustLayout('right', self.data._layout.right.offset)
    return self._view.el
  }
  runCompiler () {
    const self = this
    if (self._view.transactionDebugger.isActive) return

    self._components.fileManager.saveCurrentFile()
    self._components.editor.clearAnnotations()
    var currentFile = self._api.config.get('currentFile')
    if (currentFile) {
      if (/.(.sol)$/.exec(currentFile)) {
        // only compile *.sol file.
        var target = currentFile
        var sources = {}
        var provider = self._components.fileManager.fileProviderOf(currentFile)
        if (provider) {
          provider.get(target, (error, content) => {
            if (error) {
              console.log(error)
            } else {
              sources[target] = { content }
              self._components.compiler.compile(sources, target)
            }
          })
        } else {
          console.log('cannot compile ' + currentFile + '. Does not belong to any explorer')
        }
      }
    }
  }
}

module.exports = App

function run () {
  var self = this

  if (window.location.hostname === 'yann300.github.io') {
    modalDialogCustom.alert('This UNSTABLE ALPHA branch of Remix has been moved to http://ethereum.github.io/remix-live-alpha.')
  } else if (window.location.hostname === 'remix-alpha.ethereum.org' ||
  (window.location.hostname === 'ethereum.github.io' && window.location.pathname.indexOf('/remix-live-alpha') === 0)) {
    modalDialogCustom.alert(`This instance of the Remix IDE is an UNSTABLE ALPHA branch.\n
Please only use it if you know what you are doing, otherwise visit the stable version at http://remix.ethereum.org.`)
  } else if (window.location.protocol.indexOf('http') === 0 &&
  window.location.hostname !== 'remix.ethereum.org' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1') {
    modalDialogCustom.alert(`The Remix IDE has moved to http://remix.ethereum.org.\n
This instance of Remix you are visiting WILL NOT BE UPDATED.\n
Please make a backup of your contracts and start using http://remix.ethereum.org`)
  }

  if (window.location.protocol.indexOf('https') === 0) {
    toolTip('You are using an `https` connection. Please switch to `http` if you are using Remix against an `http Web3 provider` or allow Mixed Content in your browser.')
  }
  // Oops! Accidentally trigger refresh or bookmark.
  window.onbeforeunload = function () {
    return 'Are you sure you want to leave?'
  }

  // Run the compiler instead of trying to save the website
  $(window).keydown(function (e) {
    // ctrl+s or command+s
    if ((e.metaKey || e.ctrlKey) && e.keyCode === 83) {
      e.preventDefault()
      self.runCompiler()
    }
  })

  function importExternal (url, cb) {
    self._components.compilerImport.import(url,
      (loadingMsg) => {
        toolTip(loadingMsg)
      },
      (error, content, cleanUrl, type, url) => {
        if (!error) {
          if (filesProviders[type]) {
            filesProviders[type].addReadOnly(cleanUrl, content, url)
          }
          cb(null, content)
        } else {
          cb(error)
        }
      })
  }

  function importFileCb (url, filecb) {
    if (url.indexOf('/remix_tests.sol') !== -1) {
      return filecb(null, remixTests.assertLibCode)
    }
    var provider = fileManager.fileProviderOf(url)
    if (provider) {
      provider.exists(url, (error, exist) => {
        if (error) return filecb(error)
        if (exist) {
          return provider.get(url, filecb)
        } else {
          importExternal(url, filecb)
        }
      })
    } else if (self._components.compilerImport.isRelativeImport(url)) {
      // try to resolve localhost modules (aka truffle imports)
      var splitted = /([^/]+)\/(.*)$/g.exec(url)
      async.tryEach([
        (cb) => { importFileCb('localhost/installed_contracts/' + url, cb) },
        (cb) => { if (!splitted) { cb('url not parseable' + url) } else { importFileCb('localhost/installed_contracts/' + splitted[1] + '/contracts/' + splitted[2], cb) } },
        (cb) => { importFileCb('localhost/node_modules/' + url, cb) },
        (cb) => { if (!splitted) { cb('url not parseable' + url) } else { importFileCb('localhost/node_modules/' + splitted[1] + '/contracts/' + splitted[2], cb) } }],
        (error, result) => { filecb(error, result) }
      )
    } else {
      importExternal(url, filecb)
    }
  }

  // ----------------- Compiler -----------------
  self._components.compiler = new Compiler(importFileCb)
  var compiler = self._components.compiler
  registry.put({api: compiler, name: 'compiler'})

  var offsetToLineColumnConverter = new OffsetToLineColumnConverter(compiler.event)
  registry.put({api: offsetToLineColumnConverter, name: 'offsetToLineColumnConverter'})
  // ----------------- UniversalDApp -----------------
  var transactionContextAPI = {
    getAddress: (cb) => {
      cb(null, $('#txorigin').val())
    },
    getValue: (cb) => {
      try {
        var number = document.querySelector('#value').value
        var select = document.getElementById('unit')
        var index = select.selectedIndex
        var selectedUnit = select.querySelectorAll('option')[index].dataset.unit
        var unit = 'ether' // default
        if (selectedUnit === 'ether') {
          unit = 'ether'
        } else if (selectedUnit === 'finney') {
          unit = 'finney'
        } else if (selectedUnit === 'gwei') {
          unit = 'gwei'
        } else if (selectedUnit === 'wei') {
          unit = 'wei'
        }
        cb(null, executionContext.web3().toWei(number, unit))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      cb(null, $('#gasLimit').val())
    }
  }
  // @TODO should put this in runtab
  registry.put({api: transactionContextAPI, name: 'transactionContextAPI'})

  var udapp = new UniversalDApp({ removable: false, removable_instances: true })
  registry.put({api: udapp, name: 'udapp'})

  var udappUI = new UniversalDAppUI(udapp)
  registry.put({api: udappUI, name: 'udappUI'})

  udapp.reset({})
  udappUI.reset()
  udapp.event.register('debugRequested', this, function (txResult) {
    startdebugging(txResult.transactionHash)
  })

  // ----------------- Tx listener -----------------
  var transactionReceiptResolver = new TransactionReceiptResolver()

  var compiledContracts = function () {
    if (compiler.lastCompilationResult && compiler.lastCompilationResult.data) {
      return compiler.lastCompilationResult.data.contracts
    }
    return null
  }
  var txlistener = new Txlistener({
    api: {
      contracts: compiledContracts,
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    },
    event: {
      udapp: udapp.event
    }})
  registry.put({api: txlistener, name: 'txlistener'})

  var eventsDecoder = new EventsDecoder({
    api: {
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    }
  })
  registry.put({api: eventsDecoder, name: 'eventsDecoder'})

  txlistener.startListening()

  // ----------------- Command Interpreter -----------------
  /*
    this module basically listen on user input (from terminal && editor)
    and interpret them as commands
  */
  var cmdInterpreter = new CommandInterpreter()
  cmdInterpreter.event.register('debug', (hash, cb) => {
    startdebugging(hash)
    if (cb) cb()
  })
  cmdInterpreter.event.register('loadgist', (id, cb) => {
    loadFromGist({gist: id})
    if (cb) cb()
  })
  cmdInterpreter.event.register('loadurl', (url, cb) => {
    importExternal(url, (err, content) => {
      if (err) {
        toolTip(`Unable to load ${url} from swarm: ${err}`)
        if (cb) cb(err)
      } else {
        try {
          content = JSON.parse(content)
          async.eachOfSeries(content.sources, (value, file, callbackSource) => {
            var url = value.urls[0] // @TODO retrieve all other contents ?
            importExternal(url, (error, content) => {
              if (error) {
                toolTip(`Cannot retrieve the content of ${url}: ${error}`)
              }
              callbackSource()
            })
          }, (error) => {
            if (cb) cb(error)
          })
        } catch (e) {}
        if (cb) cb()
      }
    })
  })
  cmdInterpreter.event.register('setproviderurl', (url, cb) => {
    executionContext.setProviderFromEndpoint(url, 'web3', (error) => {
      if (error) toolTip(error)
      if (cb) cb()
    })
  })
  cmdInterpreter.event.register('batch', (url, cb) => {
    var content = editor.get(editor.current())
    if (!content) {
      toolTip('no content to execute')
      if (cb) cb()
      return
    }
    var split = content.split('\n')
    async.eachSeries(split, (value, cb) => {
      if (!cmdInterpreter.interpret(value, (error) => {
        error ? cb(`Cannot run ${value}. stopping`) : cb()
      })) {
        cb(`Cannot interpret ${value}. stopping`)
      }
    }, (error) => {
      if (error) toolTip(error)
      if (cb) cb()
    })
  })

  registry.put({api: cmdInterpreter, name: 'cmdinterpreter'})

  // ----------------- editor ----------------------------
  this._components.editor = new Editor({}) // @TODO: put into editorpanel
  var editor = self._components.editor // shortcut for the editor
  registry.put({api: editor, name: 'editor'})

  var config = self._api.config
  var filesProviders = self._api.filesProviders

  // ----------------- file manager ----------------------------

  self._components.fileManager = new FileManager()
  var fileManager = self._components.fileManager
  registry.put({api: fileManager, name: 'filemanager'})

  // ---------------- ContextualListener -----------------------
  this._components.contextualListener = new ContextualListener()
  registry.put({api: this._components.contextualListener, name: 'contextualListener'})

  // ---------------- ContextView -----------------------
  this._components.contextView = new ContextView()
  registry.put({api: this._components.contextView, name: 'contextview'})

  // ----------------- editor panel ----------------------
  this._components.editorpanel = new EditorPanel()
  registry.put({ api: this._components.editorpanel, name: 'editorpanel' })
  this._components.editorpanel.event.register('resize', direction => self._adjustLayout(direction))

  this._view.centerpanel.appendChild(this._components.editorpanel.render())

  var queryParams = new QueryParams()
  var gistHandler = new GistHandler()

  // The event listener needs to be registered as early as possible, because the
  // parent will send the message upon the "load" event.
  var filesToLoad = null
  var loadFilesCallback = function (files) { filesToLoad = files } // will be replaced later

  window.addEventListener('message', function (ev) {
    if (typeof ev.data === typeof [] && ev.data[0] === 'loadFiles') {
      loadFilesCallback(ev.data[1])
    }
  }, false)

  this.event = new EventManager()

  // Add files received from remote instance (i.e. another remix-ide)
  function loadFiles (filesSet, fileProvider, callback) {
    if (!fileProvider) fileProvider = 'browser'

    async.each(Object.keys(filesSet), (file, callback) => {
      helper.createNonClashingName(file, filesProviders[fileProvider],
      (error, name) => {
        if (error) {
          modalDialogCustom.alert('Unexpected error loading the file ' + error)
        } else if (helper.checkSpecialChars(name)) {
          modalDialogCustom.alert('Special characters are not allowed')
        } else {
          filesProviders[fileProvider].set(name, filesSet[file].content)
        }
        callback()
      })
    }, (error) => {
      if (!error) fileManager.switchFile()
      if (callback) callback(error)
    })
  }

  // Replace early callback with instant response
  loadFilesCallback = function (files) {
    loadFiles(files)
  }

  // Run if we did receive an event from remote instance while starting up
  if (filesToLoad !== null) {
    loadFiles(filesToLoad)
  }

  // ------------------ gist load ----------------
  function loadFromGist (gistId) {
    return gistHandler.handleLoad(gistId, function (gistId) {
      request.get({
        url: `https://api.github.com/gists/${gistId}`,
        json: true
      }, (error, response, data = {}) => {
        if (error || !data.files) {
          modalDialogCustom.alert(`Gist load error: ${error || data.message}`)
          return
        }
        loadFiles(data.files, 'gist', (errorLoadingFile) => {
          if (!errorLoadingFile) filesProviders['gist'].id = gistId
        })
      })
    })
  }

  var loadingFromGist = loadFromGist(queryParams.get())

  // insert ballot contract if there are no files available
  if (!loadingFromGist) {
    filesProviders['browser'].resolveDirectory('browser', (error, filesList) => {
      if (error) console.error(error)
      if (Object.keys(filesList).length === 0) {
        if (!filesProviders['browser'].set(examples.ballot.name, examples.ballot.content)) {
          modalDialogCustom.alert('Failed to store example contract in browser. Remix will not work properly. Please ensure Remix has access to LocalStorage. Safari in Private mode is known not to work.')
        } else {
          filesProviders['browser'].set(examples.ballot_test.name, examples.ballot_test.content)
        }
      }
    })
  }

  window.syncStorage = chromeCloudStorageSync
  chromeCloudStorageSync()

  // ---------------- FilePanel --------------------
  var filePanel = new FilePanel()

  // TODO this should happen inside file-panel.js
  var filepanelContainer = document.querySelector('#filepanel')
  filepanelContainer.appendChild(filePanel.render())

  filePanel.event.register('resize', delta => self._adjustLayout('left', delta))

  var previouslyOpenedFile = config.get('currentFile')
  if (previouslyOpenedFile) {
    filesProviders['browser'].get(previouslyOpenedFile, (error, content) => {
      if (!error && content) {
        fileManager.switchFile(previouslyOpenedFile)
      } else {
        fileManager.switchFile()
      }
    })
  } else {
    fileManager.switchFile()
  }

  // ----------------- Renderer -----------------
  var rendererAPI = {
    error: (file, error) => {
      if (file === config.get('currentFile')) {
        editor.addAnnotation(error)
      }
    },
    errorClick: (errFile, errLine, errCol) => {
      if (errFile !== config.get('currentFile')) {
        // TODO: refactor with this._components.contextView.jumpTo
        var provider = fileManager.fileProviderOf(errFile)
        if (provider) {
          provider.exists(errFile, (error, exist) => {
            if (error) return console.log(error)
            fileManager.switchFile(errFile)
            editor.gotoLine(errLine, errCol)
          })
        }
      } else {
        editor.gotoLine(errLine, errCol)
      }
    }
  }
  var renderer = new Renderer(rendererAPI)
  registry.put({api: renderer, name: 'renderer'})

  // ----------------- StaticAnalysis -----------------

  var staticAnalysisAPI = {
    renderWarning: (label, warningContainer, type) => {
      return renderer.error(label, warningContainer, type)
    },
    offsetToLineColumn: (location, file) => {
      return offsetToLineColumnConverter.offsetToLineColumn(location, file, compiler.lastCompilationResult)
    }
  }
  var staticanalysis = new StaticAnalysis(staticAnalysisAPI, compiler.event)
  registry.put({api: staticanalysis, name: 'staticanalysis'})

  // ---------------- Righthand-panel --------------------
  self._components.righthandpanel = new RighthandPanel()
  self._view.rightpanel.appendChild(self._components.righthandpanel.render())
  self._components.righthandpanel.init()
  self._components.righthandpanel.event.register('resize', delta => self._adjustLayout('right', delta))

  var node = document.getElementById('staticanalysisView')
  node.insertBefore(staticanalysis.render(), node.childNodes[0])

  // ----------------- editor resize ---------------

  function onResize () {
    editor.resize(document.querySelector('#editorWrap').checked)
  }
  onResize()

  self._view.el.addEventListener('change', onResize)
  document.querySelector('#editorWrap').addEventListener('change', onResize)

  // ----------------- Debugger -----------------
  var debugAPI = {
    statementMarker: null,
    fullLineMarker: null,
    source: null,
    currentSourceLocation: (lineColumnPos, location) => {
      if (this.statementMarker) editor.removeMarker(this.statementMarker, this.source)
      if (this.fullLineMarker) editor.removeMarker(this.fullLineMarker, this.source)
      this.statementMarker = null
      this.fullLineMarker = null
      this.source = null
      if (lineColumnPos) {
        this.source = compiler.getSourceName(location.file)
        if (config.get('currentFile') !== this.source) {
          fileManager.switchFile(this.source)
        }
        this.statementMarker = editor.addMarker(lineColumnPos, this.source, css.highlightcode)
        editor.scrollToLine(lineColumnPos.start.line, true, true, function () {})
        if (lineColumnPos.start.line === lineColumnPos.end.line) {
          this.fullLineMarker = editor.addMarker({
            start: {
              line: lineColumnPos.start.line,
              column: 0
            },
            end: {
              line: lineColumnPos.start.line + 1,
              column: 0
            }
          }, this.source, css.highlightcode_fullLine)
        }
      }
    },
    lastCompilationResult: () => {
      return compiler.lastCompilationResult
    },
    offsetToLineColumn: (location, file) => {
      return offsetToLineColumnConverter.offsetToLineColumn(location, file, compiler.lastCompilationResult)
    }
  }
  self._view.transactionDebugger = new Debugger('#debugger', debugAPI, editor.event)
  self._view.transactionDebugger.addProvider('vm', executionContext.vm())
  self._view.transactionDebugger.addProvider('injected', executionContext.internalWeb3())
  self._view.transactionDebugger.addProvider('web3', executionContext.internalWeb3())
  self._view.transactionDebugger.switchProvider(executionContext.getProvider())

  var txLogger = new TxLogger({
    api: {
      editorpanel: self._components.editorpanel,
      resolvedTransaction: function (hash) {
        return txlistener.resolvedTransaction(hash)
      },
      parseLogs: function (tx, contractName, contracts, cb) {
        eventsDecoder.parseLogs(tx, contractName, contracts, cb)
      },
      compiledContracts: function () {
        return compiledContracts()
      }
    },
    events: {
      txListener: txlistener.event
    }
  })

  txLogger.event.register('debugRequested', (hash) => {
    startdebugging(hash)
  })

  var previousInput = ''
  var saveTimeout = null

  function editorOnChange () {
    var currentFile = config.get('currentFile')
    if (!currentFile) {
      return
    }
    var input = editor.get(currentFile)
    if (!input) {
      return
    }
    // if there's no change, don't do anything
    if (input === previousInput) {
      return
    }
    previousInput = input

    // fire storage update
    // NOTE: save at most once per 5 seconds
    if (saveTimeout) {
      window.clearTimeout(saveTimeout)
    }
    saveTimeout = window.setTimeout(() => {
      fileManager.saveCurrentFile()
    }, 5000)
  }

  editor.event.register('contentChanged', editorOnChange)
  // in order to save the file when switching
  editor.event.register('sessionSwitched', editorOnChange)

  executionContext.event.register('contextChanged', this, function (context) {
    self.runCompiler()
  })

  executionContext.event.register('web3EndpointChanged', this, function (context) {
    self.runCompiler()
  })

  compiler.event.register('compilerLoaded', this, function (version) {
    previousInput = ''
    self.runCompiler()

    if (queryParams.get().context) {
      let context = queryParams.get().context
      let endPointUrl = queryParams.get().endPointUrl
      executionContext.setContext(context, endPointUrl,
      () => {
        modalDialogCustom.confirm(null, 'Are you sure you want to connect to an ethereum node?', () => {
          if (!endPointUrl) {
            endPointUrl = 'http://localhost:8545'
          }
          modalDialogCustom.prompt(null, 'Web3 Provider Endpoint', endPointUrl, (target) => {
            executionContext.setProviderFromEndpoint(target, context)
          }, () => {})
        }, () => {})
      },
      (alertMsg) => {
        modalDialogCustom.alert(alertMsg)
      })
    }

    if (queryParams.get().debugtx) {
      startdebugging(queryParams.get().debugtx)
    }
  })

  function startdebugging (txHash) {
    self.event.trigger('debuggingRequested', [])
    self._view.transactionDebugger.debug(txHash)
  }
}
