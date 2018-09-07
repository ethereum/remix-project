'use strict'

var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var yo = require('yo-yo')

var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')

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

function StepManager (_parent, _traceManager) {
  this.event = new EventManager()
  this._parent = _parent
  this.parent = _parent.debugger
  this.traceManager = _traceManager
  this.revertionPoint = null

  this.step_manager = new DebuggerStepManager(_parent, _traceManager)

  this.startSlider()
  this.startButtonNavigator()
}

StepManager.prototype.startSlider = function () {
  const self = this

  this.slider = new Slider()
  this.slider.event.register('sliderMoved', (step) => {
    self.step_manager.jumpTo(step)
  })
  this.step_manager.event.register('traceLengthChanged', (length) => {
    self.slider.setSliderLength(length)
  })
}

StepManager.prototype.startButtonNavigator = function () {
  const self = this
  this.buttonNavigator = new ButtonNavigator()

  // self._parent.event.register('indexChanged', this, (index) => {
  //   // if (!this.view) return
  //   if (index < 0) return
  //   if (self._parent.currentStepIndex !== index) return

  //   self.traceManager.buildCallPath(index, (error, callsPath) => {
  //     if (error) {
  //       console.log(error)
  //       if (self.buttonNavigator) {
  //         self.buttonNavigator.resetWarning('')
  //       }
  //       return
  //     }
  //     self.currentCall = callsPath[callsPath.length - 1]
  //     if (self.currentCall.reverted) {
  //       let revertedReason = self.currentCall.outofgas ? 'outofgas' : ''
  //       self.revertionPoint = self.currentCall.return
  //       if (self.buttonNavigator) {
  //         self.buttonNavigator.resetWarning(revertedReason)
  //       }
  //       return
  //     }
  //     for (var k = callsPath.length - 2; k >= 0; k--) {
  //       var parent = callsPath[k]
  //       if (!parent.reverted) continue
  //       self.revertionPoint = parent.return
  //       if (self.buttonNavigator) {
  //         self.buttonNavigator.resetWarning('parenthasthrown')
  //       }
  //     }
  //     if (self.buttonNavigator) {
  //       self.buttonNavigator.resetWarning('')
  //     }
  //   })
  // })
  this.step_manager.event.register('revertWarning', (revertedReason) => {
    if (self.buttonNavigator) {
      self.buttonNavigator.resetWarning(revertedReason)
    }
  })

  this.buttonNavigator.event.register('stepIntoBack', this, function () {
    self.step_manager.stepIntoBack()
  })
  this.buttonNavigator.event.register('stepIntoForward', this, function () {
    self.step_manager.stepIntoForward()
  })
  this.buttonNavigator.event.register('stepOverBack', this, function () {
    self.step_manager.stepOverBack()
  })
  this.buttonNavigator.event.register('stepOverForward', this, function () {
    self.step_manager.stepOverForward()
  })
  this.buttonNavigator.event.register('jumpOut', this, function () {
    self.step_manager.jumpOut()
  })
  this.buttonNavigator.event.register('jumpToException', this, function () {
    self.step_manager.jumpToException()
  })
  this.buttonNavigator.event.register('jumpNextBreakpoint', (exceptionIndex) => {
    self.step_manager.jumpNextBreakpoint()
  })
  this.buttonNavigator.event.register('jumpPreviousBreakpoint', (exceptionIndex) => {
    self.step_manager.jumpPreviousBreakpoint()
  })

  this.step_manager.event.register('stepChanged', (step, stepState, jumpOutDisabled) => {
    self.updateStep(step, stepState, jumpOutDisabled)
  })
}

StepManager.prototype.updateStep = function (step, stepState, jumpOutDisabled) {
  this.slider.setValue(step)
  this.buttonNavigator.stepChanged(stepState, jumpOutDisabled)
  this.event.trigger('stepChanged', [step])
}

StepManager.prototype.remove = function () {
  // used to stop listenning on event. bad and should be "refactored"
  this.slider.view = null
  this.slider = null
  this.buttonNavigator.view = null
  this.buttonNavigator = null
}

StepManager.prototype.render = function () {
  return yo`<div>
        ${this.slider.render()}
        ${this.buttonNavigator.render()}
      </div>`
}

module.exports = StepManager
