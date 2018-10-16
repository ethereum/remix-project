var Web3 = require('web3')
var Debugger = require('../debugger/debugger.js')
var ContextManager = require('./contextManager.js')
var EventManager = require('events')

class CmdLine {

  constructor () {
    this.events = new EventManager()
    this.lineColumnPos = null
  }

  connect (providerType, url) {
    if (providerType !== 'http') throw new Error("unsupported provider type")
    this.web3 = new Web3(new Web3.providers.HttpProvider(url))
  }

  loadCompilationResult (compilationResult) {
    this.compilation = {}
    this.compilation.lastCompilationResult = compilationResult
  }

  initDebugger () {
    const self = this
    this.contextManager = new ContextManager()

    this.debugger = new Debugger({
      web3: this.contextManager.getWeb3(),
      compiler: this.compilation
    })

    this.contextManager.event.register('providerChanged', () => {
      self.debugger.updateWeb3(self.contextManager.getWeb3())
    })

    this.contextManager.initProviders()

    this.contextManager.addProvider('debugger_web3', this.web3)
    this.contextManager.switchProvider('debugger_web3')
  }

  getSource() {
    const self = this

    console.dir("getSource")
    console.dir(this.lineColumnPos)
    console.dir(this.filename)

    let lineColumnPos = this.lineColumnPos

    if (!lineColumnPos || !lineColumnPos.start) return;

    let content = self.compilation.lastCompilationResult.source.sources[this.filename].content.split("\n")

    let source = []

    let line
    line = content[lineColumnPos.start.line - 2]
    if ( line !== undefined) {
      source.push("    " + (lineColumnPos.start.line - 1) + ":  " + line)
    }
    line = content[lineColumnPos.start.line - 1]
    if ( line !== undefined) {
      source.push("    " + lineColumnPos.start.line + ":  " + line)
    }

    let currentLineNumber = lineColumnPos.start.line
    let currentLine = content[currentLineNumber]
    source.push("=>  " + (currentLineNumber + 1) + ":  " + currentLine)

    let startLine = lineColumnPos.start.line
    for (var i=1; i < 4; i++) {
      let line = content[startLine + i]
      source.push("    " + (startLine + i + 1) + ":  " + line)
    }

    return source
  }

  // TODO: is filename really necessary?
  startDebug(txNumber, filename) {
    const self = this
    this.filename = filename
    this.debugger.debug(null, txNumber, null, () => {

      self.debugger.event.register('newSourceLocation', function (lineColumnPos, _rawLocation) {
        self.lineColumnPos = lineColumnPos
        self.events.emit("source")
      });

      self.debugger.vmDebuggerLogic.event.register('solidityState', (data) => {
        self.solidityState = data
      });

      // TODO: this doesnt work too well, it should request the data instead...
      self.debugger.vmDebuggerLogic.event.register('solidityLocals', (data) => {
        if (JSON.stringify(data) === '{}') return
        self.solidityLocals = data
      });

    })
  }

  displayLocals () {
    console.dir("= displayLocals")
    console.dir(this.solidityLocals)
  }

  displayGlobals () {
    console.dir("= displayGlobals")
    console.dir(this.solidityState)
    if (this.solidityState && this.solidityState.voters) {
      console.dir(this.solidityState.voters)
      console.dir(this.solidityState.voters.value)
    }
  }
}

module.exports = CmdLine

