'use strict'
var yo = require('yo-yo')
var async = require('async')
var remixLib = require('remix-lib')
var EventManager = require('../lib/events')

var executionContext = require('../execution-context')
var toolTip = require('../app/ui/tooltip')
var globalRegistry = require('../global/registry')
var SourceHighlighter = require('../app/editor/sourceHighlighter')
var RemixDebug = require('remix-debug').EthDebugger
var TreeView = require('../app/ui/TreeView') // TODO setup a direct reference to the UI components
var solidityTypeFormatter = require('../app/debugger/debuggerUI/vmDebugger/utils/SolidityTypeFormatter')

class CmdInterpreterAPI {
  constructor (terminal, localRegistry) {
    const self = this
    self.event = new EventManager()
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self._components.terminal = terminal
    self._components.sourceHighlighter = new SourceHighlighter()
    self._deps = {
      app: self._components.registry.get('app').api,
      fileManager: self._components.registry.get('filemanager').api,
      editor: self._components.registry.get('editor').api,
      compilersArtefacts: self._components.registry.get('compilersartefacts').api,
      offsetToLineColumnConverter: self._components.registry.get('offsettolinecolumnconverter').api
    }
    self.commandHelp = {
      'remix.call(message: {name, key, payload})': 'Call a registered plugins',
      'remix.getFile(path)': 'Returns the content of the file located at the given path',
      'remix.setFile(path, content)': 'set the content of the file located at the given path',
      'remix.debug(hash)': 'Start debugging a transaction.',
      'remix.loadgist(id)': 'Load a gist in the file explorer.',
      'remix.loadurl(url)': 'Load the given url in the file explorer. The url can be of type github, swarm, ipfs or raw http',
      'remix.setproviderurl(url)': 'Change the current provider to Web3 provider and set the url endpoint.',
      'remix.execute(filepath)': 'Run the script specified by file path. If filepath is empty, script currently displayed in the editor is executed.',
      'remix.exeCurrent()': 'Run the script currently displayed in the editor',
      'remix.help()': 'Display this help message',
      'remix.debugHelp()': 'Display help message for debugging'
    }
  }
  call (message) {
    return this._components.terminal.externalApi.request(message)
  }
  log () { arguments[0] != null ? this._components.terminal.commands.html(arguments[0]) : this._components.terminal.commands.html(arguments[1]) }
  highlight (rawLocation) {
    var self = this
    if (!rawLocation) {
      self._components.sourceHighlighter.currentSourceLocation(null)
      return
    }
    var lineColumnPos = self._deps.offsetToLineColumnConverter.offsetToLineColumn(rawLocation, rawLocation.file,
      self._deps.compilersArtefacts['__last'].getSourceCode().sources,
      self._deps.compilersArtefacts['__last'].getAsts())
    self._components.sourceHighlighter.currentSourceLocation(lineColumnPos, rawLocation)
  }
  debug (hash, cb) {
    var self = this
    delete self.d
    executionContext.web3().eth.getTransaction(hash, (error, tx) => {
      if (error) return cb(error)
      var debugSession = new RemixDebug({
        compilationResult: () => {
          return self._deps.compilersArtefacts['__last'].getData()
        }
      })
      debugSession.addProvider('web3', executionContext.web3())
      debugSession.switchProvider('web3')
      debugSession.debug(tx)
      self.d = debugSession
      this._components.terminal.commands.log('A new debugging session is available at remix.d')
      if (cb) cb(null, debugSession)
      // helpers
      self.d.highlight = (address, vmtraceIndex) => {
        if (!address) return self.highlight()
        self.d.sourceLocationFromVMTraceIndex(address, vmtraceIndex, (error, rawLocation) => {
          if (!error && rawLocation) {
            self.highlight(rawLocation)
          }
        })
      }
      self.d.stateAt = (vmTraceIndex) => {
        self.d.extractStateAt(vmTraceIndex, (error, state) => {
          if (error) return self.log(error)
          self.d.decodeStateAt(vmTraceIndex, state, (error, state) => {
            if (error) return this._components.terminal.commands.html(error)
            var treeView = new TreeView({
              json: true,
              formatSelf: solidityTypeFormatter.formatSelf,
              extractData: solidityTypeFormatter.extractData
            })
            self.log('State at ' + vmTraceIndex)
            self._components.terminal.commands.html(treeView.render(state, true))
          })
        })
      }
      self.d.localsAt = (contractAddress, vmTraceIndex) => {
        debugSession.sourceLocationFromVMTraceIndex(contractAddress, vmTraceIndex, (error, location) => {
          if (error) return self.log(error)
          debugSession.decodeLocalsAt(23, location, (error, locals) => {
            if (error) return this._components.terminal.commands.html(error)
            var treeView = new TreeView({
              json: true,
              formatSelf: solidityTypeFormatter.formatSelf,
              extractData: solidityTypeFormatter.extractData
            })
            self.log('Locals at ' + vmTraceIndex)
            self._components.terminal.commands.html(treeView.render(locals, true))
          })
        })
      }
      self.d.goTo = (row) => {
        if (self._deps.editor.current()) {
          var breakPoint = new remixLib.code.BreakpointManager(self.d, (sourceLocation) => {
            return self._deps.offsetToLineColumnConverter.offsetToLineColumn(sourceLocation, sourceLocation.file,
              self._deps.compilersArtefacts['__last'].getSourceCode().sources,
              self._deps.compilersArtefacts['__last'].getAsts())
          })
          breakPoint.event.register('breakpointHit', (sourceLocation, currentStep) => {
            self.log(null, 'step index ' + currentStep)
            self.highlight(sourceLocation)
            self.d.stateAt(currentStep)
            self.d.traceManager.getCurrentCalledAddressAt(currentStep, (error, address) => {
              if (error) return self.log(address)
              self.d.localsAt(address, currentStep)
            })
          })
          breakPoint.event.register('NoBreakpointHit', () => { self.log('line ' + row + ' is not part of the current execution') })
          breakPoint.add({fileName: self._deps.editor.current(), row: row - 1})
          breakPoint.jumpNextBreakpoint(0, true)
        }
      }
    })
  }
  loadgist (id, cb) {
    const self = this
    self._deps.app.loadFromGist({gist: id})
    if (cb) cb()
  }
  loadurl (url, cb) {
    const self = this
    self._deps.app.importExternal(url, (err, content) => {
      if (err) {
        toolTip(`Unable to load ${url}: ${err}`)
        if (cb) cb(err)
      } else {
        try {
          content = JSON.parse(content)
          async.eachOfSeries(content.sources, (value, file, callbackSource) => {
            var url = value.urls[0] // @TODO retrieve all other contents ?
            self._deps.app.importExternal(url, (error, content) => {
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
  }
  setproviderurl (url, cb) {
    executionContext.setProviderFromEndpoint(url, 'web3', (error) => {
      if (error) toolTip(error)
      if (cb) cb()
    })
  }
  exeCurrent (cb) {
    return this.execute(undefined, cb)
  }
  getFile (path, cb) {
    var provider = this._deps.fileManager.fileProviderOf(path)
    if (provider) {
      provider.get(path, cb)
    } else {
      cb('file not found')
    }
  }
  setFile (path, content, cb) {
    cb = cb || function () {}
    var provider = this._deps.fileManager.fileProviderOf(path)
    if (provider) {
      provider.set(path, content, (error) => {
        if (error) return cb(error)
        this._deps.fileManager.syncEditor(path)
        cb()
      })
    } else {
      cb('file not found')
    }
  }
  execute (file, cb) {
    const self = this

    function _execute (content, cb) {
      if (!content) {
        toolTip('no content to execute')
        if (cb) cb()
        return
      }

      self._components.terminal.commands.script(content)
    }

    if (typeof file === 'undefined') {
      var content = self._deps.editor.currentContent()
      _execute(content, cb)
      return
    }

    var provider = self._deps.fileManager.fileProviderOf(file)

    if (!provider) {
      toolTip(`provider for path ${file} not found`)
      if (cb) cb()
      return
    }

    provider.get(file, (error, content) => {
      if (error) {
        toolTip(error)
        if (cb) cb()
        return
      }

      _execute(content, cb)
    })
  }
  help (cb) {
    const self = this
    var help = yo`<div></div>`
    for (var k in self.commandHelp) {
      help.appendChild(yo`<div>${k}: ${self.commandHelp[k]}</div>`)
      help.appendChild(yo`<br>`)
    }
    self._components.terminal.commands.html(help)
    if (cb) cb()
    return ''
  }
  debugHelp (cb) {
    const self = this
    var help = yo`<div>Here are some examples of scripts that can be run (using remix.exeCurrent() or directly from the console)</div>`
    help.appendChild(yo`<br>`)
    help.appendChild(yo`<br>`)
    help.appendChild(yo`<div>remix.debug('0x3c247ac268afb9a9c183feb9d4e83df51efbc8a2f4624c740789b788dac43029', function (error, debugSession) {
     remix.log = function () { arguments[0] != null ? console.log(arguments[0]) : console.log(arguments[1]) }

     remix.d.traceManager.getLength(remix.log)
     remix.storageView = remix.d.storageViewAt(97, '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a')
     console.log('storage at 97 :')
     remix.storageView.storageRange(remix.log)
})<br/></div>`)
    help.appendChild(yo`<div>remix.log = function () { arguments[0] != null ? console.log(arguments[0]) : console.log(arguments[1]) }
    remix.d.extractStateAt(2, function (error, state) {
        remix.d.decodeStateAt(97, state, remix.log)
    })<br/></div>`)
    help.appendChild(yo`<br>`)
    help.appendChild(yo`<div>remix.highlight(contractAddress, vmTraceIndex)</div>`)
    help.appendChild(yo`<br>`)
    help.appendChild(yo`<div>remix.goTo(row) (this log the index in the vm trace, state and local variables)</div>`)
    help.appendChild(yo`<br>`)
    help.appendChild(yo`<div>remix.stateAt(vmTraceIndex)</div>`)
    help.appendChild(yo`<br>`)
    help.appendChild(yo`<div>remix.localsAt(vmTraceIndex)</div>`)
    help.appendChild(yo`<br>`)
    help.appendChild(yo`<div>Please see <a href="https://www.npmjs.com/package/remix-debug" target="_blank">https://www.npmjs.com/package/remix-debug</a> for more informations</div>`)
    self._components.terminal.commands.html(help)
    if (cb) cb()
    return ''
  }
}

module.exports = CmdInterpreterAPI
