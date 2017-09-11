'use strict'

var $ = require('jquery')
var csjs = require('csjs-inject')
var yo = require('yo-yo')
var remix = require('ethereum-remix')
var EventManager = remix.lib.EventManager

var UniversalDApp = require('./universal-dapp.js')
var Remixd = require('./lib/remixd')
var OffsetToLineColumnConverter = require('./lib/offsetToLineColumnConverter')

var QueryParams = require('./lib/query-params')
var GistHandler = require('./lib/gist-handler')
var helper = require('./lib/helper')
var Storage = require('./storage')
var Browserfiles = require('./app/files/browser-files')
var chromeCloudStorageSync = require('./app/files/chromeCloudStorageSync')
var SharedFolder = require('./app/files/shared-folder')
var Config = require('./config')
var Editor = require('./app/editor/editor')
var Renderer = require('./app/ui/renderer')
var Compiler = require('./app/compiler/compiler')
var executionContext = require('./execution-context')
var Debugger = require('./app/debugger/debugger')
var StaticAnalysis = require('./app/staticanalysis/staticAnalysisView')
var FilePanel = require('./app/panels/file-panel')
var EditorPanel = require('./app/panels/editor-panel')
var RighthandPanel = require('./app/panels/righthand-panel')
var examples = require('./app/editor/example-contracts')
var modalDialogCustom = require('./app/ui/modal-dialog-custom')
var Txlistener = require('./app/execution/txListener')
var TxLogger = require('./app/execution/txLogger')
var EventsDecoder = require('./app/execution/eventsDecoder')
var handleImports = require('./app/compiler/compiler-imports')
var FileManager = require('./app/files/fileManager')

var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

var css = csjs`
  html { box-sizing: border-box; }
  *, *:before, *:after { box-sizing: inherit; }
  body                 {
    margin             : 0;
    padding            : 0;
    font-size          : 12px;
    color              : ${styles.colors.black};
    font-weight        : normal;
  }
  .browsersolidity     {
    position           : relative;
    width              : 100vw;
    height             : 100vh;
    overflow           : hidden;
  }
  .centerpanel         {
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    overflow           : hidden;
  }
  .leftpanel           {
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    bottom             : 0;
    left               : 0;
    overflow           : hidden;
  }
  .rightpanel          {
    display            : flex;
    flex-direction     : column;
    position           : absolute;
    top                : 0;
    right              : 0;
    bottom             : 0;
    overflow           : hidden;
  }
`

class App {
  constructor (opts = {}) {
    var self = this
    self._api = {}
    var fileStorage = new Storage('sol:')
    self._api.config = new Config(fileStorage)
    self._api.filesProviders = {}
    self._api.filesProviders['browser'] = new Browserfiles(fileStorage)
    self._api.filesProviders['localhost'] = new SharedFolder(new Remixd())
    self._view = {}
    self._components = {}
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
}

module.exports = App

function run () {
  var self = this

  // ----------------- UniversalDApp -----------------
  var transactionContextAPI = {
    getAddress: (cb) => {
      cb(null, $('#txorigin').val())
    },
    getValue: (cb) => {
      try {
        var comp = $('#value').val().split(' ')
        cb(null, executionContext.web3().toWei(comp[0], comp.slice(1).join(' ')))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      cb(null, $('#gasLimit').val())
    }
  }

  var udapp = new UniversalDApp({
    api: {
      logMessage: (msg) => {
        self._components.editorpanel.log({ type: 'log', value: msg })
      }
    },
    opt: { removable: false, removable_instances: true }
  })
  udapp.reset({}, transactionContextAPI)
  udapp.event.register('debugRequested', this, function (txResult) {
    startdebugging(txResult.transactionHash)
  })

  // ----------------- Tx listener -----------------
  var transactionReceiptResolver = {
    _transactionReceipts: {},
    resolve: function (tx, cb) {
      if (this._transactionReceipts[tx.hash]) {
        return cb(null, this._transactionReceipts[tx.hash])
      }
      executionContext.web3().eth.getTransactionReceipt(tx.hash, (error, receipt) => {
        if (!error) {
          this._transactionReceipts[tx.hash] = receipt
          cb(null, receipt)
        } else {
          cb(error)
        }
      })
    }
  }

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

  var eventsDecoder = new EventsDecoder({
    api: {
      resolveReceipt: function (tx, cb) {
        transactionReceiptResolver.resolve(tx, cb)
      }
    }
  })

  txlistener.startListening()
  // ----------------- editor ----------------------------
  this._components.editor = new Editor({}) // @TODO: put into editorpanel
  // ----------------- editor panel ----------------------
  this._components.editorpanel = new EditorPanel({
    api: {
      editor: self._components.editor,
      config: self._api.config,
      txListener: txlistener
    }
  })
  this._components.editorpanel.event.register('resize', direction => self._adjustLayout(direction))

  this._view.centerpanel.appendChild(this._components.editorpanel.render())

  var queryParams = new QueryParams()
  var gistHandler = new GistHandler()

  var editor = self._components.editor
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

  var config = self._api.config
  var filesProviders = self._api.filesProviders

  var fileManager = new FileManager({
    config: config,
    editor: editor,
    filesProviders: filesProviders
  })

  // Add files received from remote instance (i.e. another browser-solidity)
  function loadFiles (filesSet) {
    for (var f in filesSet) {
      filesProviders['browser'].set(helper.createNonClashingName(f, filesProviders['browser']), filesSet[f].content)
    }
    fileManager.switchFile()
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

  var loadingFromGist = gistHandler.handleLoad(queryParams.get(), function (gistId) {
    $.ajax({
      url: 'https://api.github.com/gists/' + gistId,
      jsonp: 'callback',
      dataType: 'jsonp',
      success: function (response) {
        if (response.data) {
          if (!response.data.files) {
            modalDialogCustom.alert('Gist load error: ' + response.data.message)
            return
          }
          loadFiles(response.data.files)
        }
      }
    })
  })

  // insert ballot contract if there are no files available
  if (!loadingFromGist && Object.keys(filesProviders['browser'].list()).length === 0) {
    if (!filesProviders['browser'].set(examples.ballot.name, examples.ballot.content)) {
      modalDialogCustom.alert('Failed to store example contract in browser. Remix will not work properly. Please ensure Remix has access to LocalStorage. Safari in Private mode is known not to work.')
    }
  }

  window.syncStorage = chromeCloudStorageSync
  chromeCloudStorageSync()

  // ---------------- FilePanel --------------------
  var FilePanelAPI = {
    switchFile: function (path) {
      fileManager.switchFile(path)
    },
    event: this.event,
    currentFile: function () {
      return config.get('currentFile')
    },
    currentContent: function () {
      return editor.get(config.get('currentFile'))
    },
    setText: function (text) {
      editor.setText(text)
    }
  }
  var filePanel = new FilePanel(FilePanelAPI, filesProviders)

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

  var compiler = new Compiler((url, cb) => {
    var provider = fileManager.fileProviderOf(url)
    if (provider && provider.exists(url)) {
      cb(null, provider.get(url, cb))
    }
    handleImports.import(url, (error, content) => {
      if (!error) {
        // FIXME: at some point we should invalidate the browser cache
        filesProviders['browser'].addReadOnly(url, content)
        cb(null, content)
      } else {
        modalDialogCustom.alert('Unable to import: url')
      }
    })
  })
  var offsetToLineColumnConverter = new OffsetToLineColumnConverter(compiler.event)

  // ----------------- Renderer -----------------
  var rendererAPI = {
    error: (file, error) => {
      if (file === config.get('currentFile')) {
        editor.addAnnotation(error)
      }
    },
    errorClick: (errFile, errLine, errCol) => {
      if (errFile !== config.get('currentFile') && (filesProviders['browser'].exists(errFile) || filesProviders['localhost'].exists(errFile))) {
        fileManager.switchFile(errFile)
      }
      editor.gotoLine(errLine, errCol)
    }
  }
  var renderer = new Renderer(rendererAPI)

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

  // ---------------- Righthand-panel --------------------

  var rhpAPI = {
    config: config,
    setEditorSize (delta) {
      $('#righthand-panel').css('width', delta)
      self._view.centerpanel.style.right = delta + 'px'
      document.querySelector(`.${css.dragbar2}`).style.right = delta + 'px'
      onResize()
    },
    getContracts: () => {
      if (compiler.lastCompilationResult && compiler.lastCompilationResult.data) {
        return compiler.lastCompilationResult.data.contracts
      }
      return null
    },
    udapp: () => {
      return udapp
    },
    fileProviderOf: (path) => {
      return fileManager.fileProviderOf(path)
    },
    getBalance: (address, callback) => {
      udapp.getBalance(address, (error, balance) => {
        if (error) {
          callback(error)
        } else {
          callback(null, executionContext.web3().fromWei(balance, 'ether'))
        }
      })
    },
    compilationMessage: (message, container, options) => {
      renderer.error(message, container, options)
    },
    currentCompiledSourceCode: () => {
      if (compiler.lastCompilationResult.source) {
        return compiler.lastCompilationResult.source.sources[compiler.lastCompilationResult.source.target]
      }
      return ''
    },
    resetDapp: (contracts) => {
      udapp.reset(contracts, transactionContextAPI)
    },
    setOptimize: (optimize, runCompilation) => {
      compiler.setOptimize(optimize)
      if (runCompilation) runCompiler()
    },
    loadCompiler: (usingWorker, url) => {
      compiler.loadVersion(usingWorker, url)
    },
    runCompiler: () => {
      runCompiler()
    },
    logMessage: (msg) => {
      self._components.editorpanel.log({type: 'log', value: msg})
    }
  }
  var rhpEvents = {
    compiler: compiler.event,
    app: self.event,
    udapp: udapp.event,
    editor: editor.event,
    staticAnalysis: staticanalysis.event
  }
  self._components.righthandpanel = new RighthandPanel(rhpAPI, rhpEvents, {})
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
        this.source = compiler.lastCompilationResult.data.sourceList[location.file] // auto switch to that tab
        if (config.get('currentFile') !== this.source) {
          fileManager.switchFile(this.source)
        }
        this.statementMarker = editor.addMarker(lineColumnPos, this.source, 'highlightcode')
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
          }, this.source, 'highlightcode_fullLine')
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
  var transactionDebugger = new Debugger('#debugger', debugAPI, editor.event)
  transactionDebugger.addProvider('vm', executionContext.vm())
  transactionDebugger.addProvider('injected', executionContext.web3())
  transactionDebugger.addProvider('web3', executionContext.web3())
  transactionDebugger.switchProvider(executionContext.getProvider())

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

  function runCompiler () {
    if (transactionDebugger.isActive) return

    fileManager.saveCurrentFile()
    var currentFile = config.get('currentFile')
    if (currentFile) {
      var target = currentFile
      var sources = {}
      var provider = fileManager.fileProviderOf(currentFile)
      if (provider) {
        provider.get(target, (error, content) => {
          if (error) {
            console.log(error)
          } else {
            sources[target] = content
            compiler.compile(sources, target)
          }
        })
      } else {
        console.log('cannot compile ' + currentFile + '. Does not belong to any explorer')
      }
    }
  }

  var previousInput = ''
  var saveTimeout = null

  function editorOnChange () {
    var currentFile = config.get('currentFile')
    if (!currentFile) {
      return
    }
    var input = editor.get(currentFile)

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
    runCompiler()
  })

  executionContext.event.register('web3EndpointChanged', this, function (context) {
    runCompiler()
  })

  compiler.event.register('compilerLoaded', this, function (version) {
    previousInput = ''
    runCompiler()

    if (queryParams.get().context) {
      executionContext.setContext(queryParams.get().context, queryParams.get().endpointurl)
    }

    if (queryParams.get().debugtx) {
      startdebugging(queryParams.get().debugtx)
    }
  })

  compiler.event.register('compilationStarted', this, function () {
    editor.clearAnnotations()
  })

  function startdebugging (txHash) {
    self.event.trigger('debuggingRequested', [])
    transactionDebugger.debug(txHash)
  }
}
