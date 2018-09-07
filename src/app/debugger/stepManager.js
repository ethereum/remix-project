var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

class DebuggerStepManager {

  constructor (_parent, _traceManager) {
    this.event = new EventManager()
    this._parent = _parent
    this.parent = _parent.debugger
    this.traceManager = _traceManager
    this.currentStepIndex = 0
    this.traceLength = 0
    this.revertionPoint = null

    this.listenToEvents()
  }

  listenToEvents () {
    const self = this

    this.parent.event.register('newTraceLoaded', this, function () {
      self.traceManager.getLength(function (error, newLength) {
        if (error) {
          return console.log(error)
        }
        if (self.traceLength !== newLength) {
          self.event.trigger('traceLengthChanged', [newLength])
          self.traceLength = newLength
        }
        self.jumpTo(0)
      })
    })

    this.parent.callTree.event.register('callTreeReady', () => {
      if (self.parent.callTree.functionCallStack.length) {
        self.jumpTo(self.parent.callTree.functionCallStack[0])
      }
    })

    this._parent.event.register('indexChanged', this, (index) => {
      if (index < 0) return
      if (self._parent.currentStepIndex !== index) return

      self.traceManager.buildCallPath(index, (error, callsPath) => {
        if (error) {
          console.log(error)
          return self.event.trigger('revertWarning', [''])
          // if (self.buttonNavigator) {
          //   self.buttonNavigator.resetWarning('')
          // }
          // return
        }
        self.currentCall = callsPath[callsPath.length - 1]
        if (self.currentCall.reverted) {
          let revertedReason = self.currentCall.outofgas ? 'outofgas' : ''
          self.revertionPoint = self.currentCall.return
          return self.event.trigger('revertWarning', [revertedReason])
          // if (self.buttonNavigator) {
          //   self.buttonNavigator.resetWarning(revertedReason)
          // }
          // return
        }
        for (var k = callsPath.length - 2; k >= 0; k--) {
          var parent = callsPath[k]
          if (!parent.reverted) continue
          self.revertionPoint = parent.return
          self.event.trigger('revertWarning', ['parenthasthrown'])
          // if (self.buttonNavigator) {
          //   self.buttonNavigator.resetWarning('parenthasthrown')
          // }
        }
        self.event.trigger('revertWarning', [''])
        // if (self.buttonNavigator) {
        //   self.buttonNavigator.resetWarning('')
        // }
      })
    })
  }

  triggerStepChanged (step) {
    const self = this
    this.traceManager.getLength(function (error, length) {
      let stepState = 'valid'

      if (error) {
        stepState = 'invalid'
      } else if (step <= 0) {
        stepState = 'initial'
      } else if (step >= length - 1) {
        stepState = 'end'
      }

      let jumpOutDisabled = (step === self.traceManager.findStepOut(step))

      self.event.trigger('stepChanged', [step, stepState, jumpOutDisabled])
    })
  }

  stepIntoBack () {
    if (!this.traceManager.isLoaded()) return
    var step = this.currentStepIndex - 1
    this.currentStepIndex = step
    if (!this.traceManager.inRange(step)) {
      return
    }
    this.event.trigger('stepChanged', [step])
  }

  stepIntoForward () {
    if (!this.traceManager.isLoaded()) return
    var step = this.currentStepIndex + 1
    this.currentStepIndex = step
    if (!this.traceManager.inRange(step)) {
      return
    }
    this.event.trigger('stepChanged', [step])
  }

  stepOverBack () {
    if (!this.traceManager.isLoaded()) return
    var step = this.traceManager.findStepOverBack(this.currentStepIndex)
    this.currentStepIndex = step
    this.event.trigger('stepChanged', [step])
  }

  stepOverForward () {
    if (!this.traceManager.isLoaded()) return
    var step = this.traceManager.findStepOverForward(this.currentStepIndex)
    this.currentStepIndex = step
    this.event.trigger('stepChanged', [step])
  }

  jumpOut () {
    if (!this.traceManager.isLoaded()) return
    var step = this.traceManager.findStepOut(this.currentStepIndex)
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
    // TODO: this is the same currentStepIndex var but currently coupled all the way up to EthDebuggerUI
    // the trigger in updateStep is updating it in EthDebuggerUI
    // the refactor should remove it
    this.parent.breakpointManager.jumpNextBreakpoint(this._parent.currentStepIndex, true)
  }

  jumpPreviousBreakpoint () {
    this.parent.breakpointManager.jumpPreviousBreakpoint(this._parent.currentStepIndex, true)
  }

}

module.exports = DebuggerStepManager
