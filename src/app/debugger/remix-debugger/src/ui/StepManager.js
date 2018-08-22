'use strict'
var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var yo = require('yo-yo')
var util = remixLib.util

function StepManager (_parent, _traceManager) {
  this.event = new EventManager()
  this.parent = _parent.debugger
  this.traceManager = _traceManager
  this.sourceMapByAddress = {}
  this.solidityMode = false

  var self = this
  this.parent.event.register('newTraceLoaded', this, function () {
    if (!this.slider) return
    self.traceManager.getLength(function (error, length) {
      if (error) {
        console.log(error)
      } else {
        self.slider.init(length)
        self.init()
      }
    })
  })

  this.slider = new Slider(this.traceManager, (step) => {
    return this.solidityMode ? this.resolveToReducedTrace(step, 0) : step
  })
  this.slider.event.register('moved', this, function (step) {
    self.sliderMoved(step)
  })

  this.parent.callTree.event.register('callTreeReady', () => {
    if (!this.slider) return
    if (this.parent.callTree.functionCallStack.length) {
      this.jumpTo(this.parent.callTree.functionCallStack[0])
    }
  })

  this.buttonNavigator = new ButtonNavigator(_parent, this.traceManager)
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
  this.buttonNavigator.event.register('jumpToException', this, function (exceptionIndex) {
    self.jumpTo(exceptionIndex)
  })
  this.buttonNavigator.event.register('jumpNextBreakpoint', (exceptionIndex) => {
    self.parent.breakpointManager.jumpNextBreakpoint(_parent.currentStepIndex, true)
  })
  this.buttonNavigator.event.register('jumpPreviousBreakpoint', (exceptionIndex) => {
    self.parent.breakpointManager.jumpPreviousBreakpoint(_parent.currentStepIndex, true)
  })
}

StepManager.prototype.remove = function () {
  // used to stop listenning on event. bad and should be "refactored"
  this.slider.view = null
  this.slider = null
  this.buttonNavigator.view = null
  this.buttonNavigator = null
}

StepManager.prototype.resolveToReducedTrace = function (value, incr) {
  if (this.parent.callTree.reducedTrace.length) {
    var nextSource = util.findClosestIndex(value, this.parent.callTree.reducedTrace)
    nextSource = nextSource + incr
    if (nextSource <= 0) {
      nextSource = 0
    } else if (nextSource > this.parent.callTree.reducedTrace.length) {
      nextSource = this.parent.callTree.reducedTrace.length - 1
    }
    return this.parent.callTree.reducedTrace[nextSource]
  }
  return value
}

StepManager.prototype.render = function () {
  return yo`<div>
        ${this.slider.render()}
        ${this.buttonNavigator.render()}
      </div>`
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

StepManager.prototype.newTraceAvailable = function () {
  this.init()
}

StepManager.prototype.jumpTo = function (step) {
  if (!this.traceManager.inRange(step)) {
    return
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.sliderMoved = function (step) {
  if (!this.traceManager.inRange(step)) {
    return
  }
  this.changeState(step)
}

StepManager.prototype.stepIntoForward = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.currentStepIndex
  if (this.solidityMode) {
    step = this.resolveToReducedTrace(step, 1)
  } else {
    step += 1
  }
  if (!this.traceManager.inRange(step)) {
    return
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.stepIntoBack = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.currentStepIndex
  if (this.solidityMode) {
    step = this.resolveToReducedTrace(step, -1)
  } else {
    step -= 1
  }
  if (!this.traceManager.inRange(step)) {
    return
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.stepOverForward = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.traceManager.findStepOverForward(this.currentStepIndex)
  if (this.solidityMode) {
    step = this.resolveToReducedTrace(step, 1)
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.stepOverBack = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.traceManager.findStepOverBack(this.currentStepIndex)
  if (this.solidityMode) {
    step = this.resolveToReducedTrace(step, -1)
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.jumpOut = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.traceManager.findStepOut(this.currentStepIndex)
  if (this.solidityMode) {
    step = this.resolveToReducedTrace(step, 0)
  }
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.changeState = function (step) {
  this.currentStepIndex = step
  this.buttonNavigator.stepChanged(step)
  this.event.trigger('stepChanged', [step])
}

module.exports = StepManager
