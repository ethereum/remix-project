const remixLib = require('remix-lib')
const EventManager = remixLib.EventManager
const util = remixLib.util

class DebuggerStepManager {

  constructor (_debugger, traceManager) {
    this.event = new EventManager()
    this.debugger = _debugger
    this.traceManager = traceManager
    this.currentStepIndex = 0
    this.traceLength = 0
    this.codeTraceLength = 0
    this.revertionPoint = null

    this.listenToEvents()
  }

  listenToEvents () {
    this.debugger.event.register('newTraceLoaded', this, () => {
      this.traceManager.getLength((error, newLength) => {
        if (error) {
          return console.log(error)
        }
        if (this.traceLength !== newLength) {
          this.event.trigger('traceLengthChanged', [newLength])
          this.traceLength = newLength
          this.codeTraceLength = this.calculateCodeLength()
        }
        this.jumpTo(0)
      })
    })

    this.debugger.callTree.event.register('callTreeReady', () => {
      if (this.debugger.callTree.functionCallStack.length) {
        this.jumpTo(this.debugger.callTree.functionCallStack[0])
      }
    })

    this.event.register('indexChanged', this, (index) => {
      if (index < 0) return
      if (this.currentStepIndex !== index) return

      this.traceManager.buildCallPath(index, (error, callsPath) => {
        if (error) {
          console.log(error)
          return this.event.trigger('revertWarning', [''])
        }
        this.currentCall = callsPath[callsPath.length - 1]
        if (this.currentCall.reverted) {
          let revertedReason = this.currentCall.outofgas ? 'outofgas' : ''
          this.revertionPoint = this.currentCall.return
          return this.event.trigger('revertWarning', [revertedReason])
        }
        for (var k = callsPath.length - 2; k >= 0; k--) {
          var parent = callsPath[k]
          if (!parent.reverted) continue
          this.revertionPoint = parent.return
          this.event.trigger('revertWarning', ['parenthasthrown'])
        }
        this.event.trigger('revertWarning', [''])
      })
    })
  }

  triggerStepChanged (step) {
    this.traceManager.getLength((error, length) => {
      let stepState = 'valid'

      if (error) {
        stepState = 'invalid'
      } else if (step <= 0) {
        stepState = 'initial'
      } else if (step >= length - 1) {
        stepState = 'end'
      }

      let jumpOutDisabled = (step === this.traceManager.findStepOut(step))

      this.event.trigger('stepChanged', [step, stepState, jumpOutDisabled])
    })
  }

  stepIntoBack (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    let step = this.currentStepIndex - 1
    this.currentStepIndex = step
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, -1)
    }
    if (!this.traceManager.inRange(step)) {
      return
    }
    this.event.trigger('stepChanged', [step])
  }

  stepIntoForward (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    let step = this.currentStepIndex + 1
    this.currentStepIndex = step
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, 1)
    }
    if (!this.traceManager.inRange(step)) {
      return
    }
    this.event.trigger('stepChanged', [step])
  }

  stepOverBack (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    let step = this.traceManager.findStepOverBack(this.currentStepIndex)
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, -1)
    }
    this.currentStepIndex = step
    this.event.trigger('stepChanged', [step])
  }

  stepOverForward (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    let step = this.currentStepIndex + 1
    let scope = this.debugger.callTree.findScope(step)
    if (scope && scope.firstStep === step) {
      step = scope.lastStep + 1
    }
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, 1)
    }
    this.currentStepIndex = step
    this.event.trigger('stepChanged', [step])
  }

  jumpOut (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    var step = this.traceManager.findStepOut(this.currentStepIndex)
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, 0)
    }
    this.currentStepIndex = step
    this.event.trigger('stepChanged', [step])
  }

  jumpTo (step) {
    if (!this.traceManager.inRange(step)) return
    this.currentStepIndex = step
    this.event.trigger('stepChanged', [step])
  }

  jumpToException () {
    this.jumpTo(this.revertionPoint)
  }

  jumpNextBreakpoint () {
    this.debugger.breakpointManager.jumpNextBreakpoint(this.currentStepIndex, true)
  }

  jumpPreviousBreakpoint () {
    this.debugger.breakpointManager.jumpPreviousBreakpoint(this.currentStepIndex, true)
  }

  calculateFirstStep () {
    let step = this.resolveToReducedTrace(0, 1)
    return this.resolveToReducedTrace(step, 1)
  }

  calculateCodeStepList () {
    let step = 0
    let steps = []
    while (step < this.traceLength) {
      let _step = this.resolveToReducedTrace(step, 1)
      if (!_step) break
      steps.push(_step)
      step += 1
    }
    steps = steps.filter((item, pos, self) => { return steps.indexOf(item) === pos })
    return steps
  }

  calculateCodeLength () {
    this.calculateCodeStepList().reverse()
    return this.calculateCodeStepList().reverse()[1] || this.traceLength
  }

  nextStep () {
    return this.resolveToReducedTrace(this.currentStepIndex, 1)
  }

  previousStep () {
    return this.resolveToReducedTrace(this.currentStepIndex, -1)
  }

  resolveToReducedTrace (value, incr) {
    if (this.debugger.callTree.reducedTrace.length) {
      var nextSource = util.findClosestIndex(value, this.debugger.callTree.reducedTrace)
      nextSource = nextSource + incr
      if (nextSource <= 0) {
        nextSource = 0
      } else if (nextSource > this.debugger.callTree.reducedTrace.length) {
        nextSource = this.debugger.callTree.reducedTrace.length - 1
      }
      return this.debugger.callTree.reducedTrace[nextSource]
    }
    return value
  }

}

module.exports = DebuggerStepManager
