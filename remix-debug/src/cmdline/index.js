var Web3 = require('web3')
var Debugger = require('../debugger/debugger.js')
var ContextManager = require('./contextManager.js')

class CmdLine {

  constructor () {
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

  // TODO: is filename really necessary?
  startDebug(txNumber, filename) {
    const self = this
    this.debugger.debug(null, txNumber, null, () => {

      self.debugger.event.register('newSourceLocation', function (lineColumnPos, rawLocation) {
        if (!lineColumnPos || !lineColumnPos.start) return;

        let content = self.compilation.lastCompilationResult.source.sources['browser/ballot.sol'].content.split("\n")

        let line
        line = content[lineColumnPos.start.line - 2]
        if ( line !== undefined) {
          console.dir("    " + (lineColumnPos.start.line - 1) + ":  " + line)
        }
        line = content[lineColumnPos.start.line - 1]
        if ( line !== undefined) {
          console.dir("    " + lineColumnPos.start.line + ":  " + line)
        }

        let currentLineNumber = lineColumnPos.start.line
        let currentLine = content[currentLineNumber]
        console.dir("=>  " + (currentLineNumber + 1) + ":  " + currentLine)

        let startLine = lineColumnPos.start.line
        for (var i=1; i < 4; i++) {
          let line = content[startLine + i]
          console.dir("    " + (startLine + i + 1) + ":  " + line)
        }
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
    console.dir(this.solidityLocals)
  }

  displayGlobals () {
    console.dir(this.solidityState)
    if (this.solidityState && this.solidityState.voters) {
      console.dir(this.solidityState.voters)
      console.dir(this.solidityState.voters.value)
    }
  }
}

module.exports = CmdLine

