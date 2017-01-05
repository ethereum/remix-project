'use strict'
var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')
var EventManager = require('../lib/eventManager')
var yo = require('yo-yo')

function StepManager (_parent, _traceManager) {
  this.event = new EventManager()
  this.parent = _parent
  this.traceManager = _traceManager

  var self = this
  this.parent.event.register('newTraceLoaded', this, function () {
    self.traceManager.getLength(function (error, length) {
      if (error) {
        console.log(error)
      } else {
        self.slider.init(length)
        self.init()
      }
    })
  })

  this.slider = new Slider(this.traceManager)
  this.slider.event.register('moved', this, function (step) {
    self.sliderMoved(step)
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
  this.buttonNavigator.event.register('jumpNextCall', this, function () {
    self.jumpNextCall()
  })
  this.buttonNavigator.event.register('jumpOut', this, function () {
    self.jumpOut()
  })
  this.buttonNavigator.event.register('jumpToException', this, function (exceptionIndex) {
    self.jumpTo(exceptionIndex)
  })
}

StepManager.prototype.render = function () {
  return (
  yo`<div>
        ${this.slider.render()}
        ${this.buttonNavigator.render()}
      </div>`
  )
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
  var step = this.currentStepIndex + 1
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
  var step = this.currentStepIndex - 1
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
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.stepOverBack = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.traceManager.findStepOverBack(this.currentStepIndex)
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.jumpNextCall = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.traceManager.findNextCall(this.currentStepIndex)
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.jumpOut = function () {
  if (!this.traceManager.isLoaded()) {
    return
  }
  var step = this.traceManager.findStepOut(this.currentStepIndex)
  this.slider.setValue(step)
  this.changeState(step)
}

StepManager.prototype.changeState = function (step) {
  this.currentStepIndex = step
  this.buttonNavigator.stepChanged(step)
  this.event.trigger('stepChanged', [step])
}

module.exports = StepManager
