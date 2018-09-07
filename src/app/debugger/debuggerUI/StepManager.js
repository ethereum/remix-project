'use strict'

var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var yo = require('yo-yo')

var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')

function StepManager (_parent, _traceManager) {
  this.event = new EventManager()
  this.parent = _parent.debugger
  this.traceManager = _traceManager
  this.sourceMapByAddress = {}
  this.solidityMode = false

  this.revertionPoint = null

  var self = this
  this.parent.event.register('newTraceLoaded', this, function () {
    if (!this.slider) return
    self.traceManager.getLength(function (error, length) {
      if (error) {
        return console.log(error)
      }
      self.slider.setSliderLength(length)
      self.init()
    })
  })

  this.slider = new Slider()
  this.slider.event.register('sliderMoved', this, function (step) {
    self.sliderMoved(step)
  })

  this.parent.callTree.event.register('callTreeReady', () => {
    if (!this.slider) return
    if (this.parent.callTree.functionCallStack.length) {
      this.jumpTo(this.parent.callTree.functionCallStack[0])
    }
  })

  this.buttonNavigator = new ButtonNavigator()

  _parent.event.register('indexChanged', this, (index) => {
    // if (!this.view) return
    if (index < 0) return
    if (_parent.currentStepIndex !== index) return

    self.traceManager.buildCallPath(index, (error, callsPath) => {
      if (error) {
        console.log(error)
        if (self.buttonNavigator) {
          self.buttonNavigator.resetWarning('')
        }
        return
      }
      self.currentCall = callsPath[callsPath.length - 1]
      if (self.currentCall.reverted) {
        let revertedReason = self.currentCall.outofgas ? 'outofgas' : ''
        self.revertionPoint = self.currentCall.return
        if (self.buttonNavigator) {
          self.buttonNavigator.resetWarning(revertedReason)
        }
        return
      }
      for (var k = callsPath.length - 2; k >= 0; k--) {
        var parent = callsPath[k]
        if (!parent.reverted)  continue
        self.revertionPoint = parent.return
        if (self.buttonNavigator) {
          self.buttonNavigator.resetWarning('parenthasthrown')
        }
      }
      if (self.buttonNavigator) {
        self.buttonNavigator.resetWarning('')
      }
    })
  })

  this.buttonNavigator.event.register('stepIntoBack', this, function () {
    self.stepIntoBack()
  })
  this.buttonNavigator.event.register('stepIntoForward', this, function () {
    self.stepIntoForward()
  })
  this.buttonNavigator.event.register('stepOverBack', this, function () {
    self.stepOverBack()
  })
  this.buttonNavigator.event.register('stepOverForward', this, function () {
    self.stepOverForward()
  })
  this.buttonNavigator.event.register('jumpOut', this, function () {
    self.jumpOut()
  })
  this.buttonNavigator.event.register('jumpToException', this, function () {
    self.jumpTo(self.revertionPoint)
  })
  this.buttonNavigator.event.register('jumpNextBreakpoint', (exceptionIndex) => {
    self.parent.breakpointManager.jumpNextBreakpoint(_parent.currentStepIndex, true)
  })
  this.buttonNavigator.event.register('jumpPreviousBreakpoint', (exceptionIndex) => {
    self.parent.breakpointManager.jumpPreviousBreakpoint(_parent.currentStepIndex, true)
  })
}

StepManager.prototype.reset = function () {
  this.slider.setValue(0)
  this.currentStepIndex = 0
  this.buttonNavigator.reset()
}

StepManager.prototype.init = function () {
  this.slider.setValue(0)
  this.changeState(0)
}

StepManager.prototype.jumpTo = function (step) {
  if (!this.traceManager.inRange(step)) return
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.sliderMoved = function (step) {
  if (!this.traceManager.inRange(step)) return
  this.changeState(step)
}

StepManager.prototype.stepIntoForward = function () {
  if (!this.traceManager.isLoaded()) return
  var step = this.currentStepIndex + 1
  if (!this.traceManager.inRange(step)) {
    return
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.stepIntoBack = function () {
  if (!this.traceManager.isLoaded()) return
  var step = this.currentStepIndex - 1
  if (!this.traceManager.inRange(step)) {
    return
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.stepOverForward = function () {
  if (!this.traceManager.isLoaded()) return
  var step = this.traceManager.findStepOverForward(this.currentStepIndex)
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.stepOverBack = function () {
  if (!this.traceManager.isLoaded()) return
  var step = this.traceManager.findStepOverBack(this.currentStepIndex)
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.jumpOut = function () {
  if (!this.traceManager.isLoaded()) return
  var step = this.traceManager.findStepOut(this.currentStepIndex)
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.changeState = function (step) {
  const self = this
  this.currentStepIndex = step

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

    self.buttonNavigator.stepChanged(stepState, jumpOutDisabled)
  })

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
