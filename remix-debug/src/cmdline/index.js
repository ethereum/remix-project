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
        console.dir("newSourceLocation")

        if (!lineColumnPos || !lineColumnPos.start) return;

        let line
        line = self.compilation.lastCompilationResult.source.sources['browser/ballot.sol'].content.split("\n")[lineColumnPos.start.line - 1]
        console.dir("    " + (lineColumnPos.start.line - 1) + "  " + line)
        line = self.compilation.lastCompilationResult.source.sources['browser/ballot.sol'].content.split("\n")[lineColumnPos.start.line]
        console.dir("=>  " + lineColumnPos.start.line + "  " + line)
        line = self.compilation.lastCompilationResult.source.sources['browser/ballot.sol'].content.split("\n")[lineColumnPos.start.line + 1]
        console.dir("    " + (lineColumnPos.start.line + 1) + "  " + line)
        line = self.compilation.lastCompilationResult.source.sources['browser/ballot.sol'].content.split("\n")[lineColumnPos.start.line + 2]
        console.dir("    " + (lineColumnPos.start.line + 2) + "  " + line)
      });

      self.debugger.step_manager.event.register('stepChanged', (stepIndex) => {
        // console.dir("---------")
        // console.dir("stepChanged: " + stepIndex)
        // console.dir("---------")
      })

      self.debugger.step_manager.event.register('traceLengthChanged', (traceLength) => {
        // console.dir("---------")
        // console.dir("traceLengthChanged: " + traceLength)
        // console.dir("---------")
      });

      self.debugger.vmDebuggerLogic.event.register('solidityState', (data) => {
        self.solidityState = data
      });

      self.debugger.vmDebuggerLogic.event.register('solidityLocals', (data) => {
        self.solidityLocals = data
      });

      self.debugger.vmDebuggerLogic.event.register('traceManagerMemoryUpdate', (data) => {
        // console.dir("---------")
        // console.dir("traceManagerMemoryUpdate")
        // console.dir(data)
        // console.dir("---------")
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

