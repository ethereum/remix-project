import { util } from '@remix-project/remix-lib'
import { EventManager } from '../eventManager'

export class DebuggerStepManager {
  event
  debugger
  traceManager
  currentStepIndex: number
  traceLength: number
  codeTraceLength: number
  revertionPoint
  currentCall

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

      this.traceManager.buildCallPath(index).then((callsPath) => {
        this.currentCall = callsPath[callsPath.length - 1]
        if (this.currentCall.reverted) {
          const revertedReason = this.currentCall.outofgas ? 'outofgas' : 'reverted'
          this.revertionPoint = this.currentCall.return
          this.event.trigger('revertWarning', [revertedReason])
          return 
        }
        for (let k = callsPath.length - 2; k >= 0; k--) {
          const parent = callsPath[k]
          if (parent.reverted) {
            this.revertionPoint = parent.return
            this.event.trigger('revertWarning', ['parenthasthrown'])
            return
          }
        }
        this.event.trigger('revertWarning', [''])
      }).catch((error) => {
        console.log(error)
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

      const jumpOutDisabled = (step === this.traceManager.findStepOut(step))
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
    this.triggerStepChanged(step)
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
    this.triggerStepChanged(step)
  }

  stepOverBack (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    let step = this.traceManager.findStepOverBack(this.currentStepIndex)
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, -1)
    }
    if (this.currentStepIndex === step) return
    this.currentStepIndex = step
    this.triggerStepChanged(step)
  }

  stepOverForward (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    if (this.currentStepIndex >= this.traceLength - 1) return
    let step = this.currentStepIndex + 1
    const scope = this.debugger.callTree.findScope(step)
    if (scope && scope.firstStep === step) {
      step = scope.lastStep + 1
    }
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, 1)
    }
    if (this.currentStepIndex === step) return
    this.currentStepIndex = step
    this.triggerStepChanged(step)
  }

  jumpOut (solidityMode) {
    if (!this.traceManager.isLoaded()) return
    let step = this.traceManager.findStepOut(this.currentStepIndex)
    if (solidityMode) {
      step = this.resolveToReducedTrace(step, 0)
    }
    if (this.currentStepIndex === step) return
    this.currentStepIndex = step
    this.triggerStepChanged(step)
  }

  jumpTo (step) {
    if (!this.traceManager.inRange(step)) return
    if (this.currentStepIndex === step) return
    this.currentStepIndex = step
    this.triggerStepChanged(step)
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
    const step = this.resolveToReducedTrace(0, 1)
    return this.resolveToReducedTrace(step, 1)
  }

  calculateCodeStepList () {
    let step = 0
    let steps = []
    while (step < this.traceLength) {
      const _step = this.resolveToReducedTrace(step, 1)
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
    if (!this.debugger.callTree.reducedTrace.length) {
      return value
    }
    let nextSource = util.findClosestIndex(value, this.debugger.callTree.reducedTrace)
    nextSource = nextSource + incr
    if (nextSource <= 0) {
      nextSource = 0
    } else if (nextSource > this.debugger.callTree.reducedTrace.length) {
      nextSource = this.debugger.callTree.reducedTrace.length - 1
    }
    return this.debugger.callTree.reducedTrace[nextSource]
  }
}
