'use strict'
var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')
var style = require('./styles/basicStyles')
var util = require('../helpers/global')
var EventManager = require('../lib/eventManager')
var yo = require('yo-yo')
var ui = require('../helpers/ui')

function StepManager (_parent, _traceManager) {
  util.extend(this, new EventManager())
  this.parent = _parent
  this.traceManager = _traceManager

  var self = this
  this.parent.register('newTraceLoaded', this, function () {
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
  this.slider.register('moved', this, function (step) {
    self.sliderMoved(step)
  })

  this.buttonNavigator = new ButtonNavigator(this.traceManager)
  this.buttonNavigator.register('stepIntoBack', this, function () {
    self.stepIntoBack()
  })
  this.buttonNavigator.register('stepIntoForward', this, function () {
    self.stepIntoForward()
  })
  this.buttonNavigator.register('stepOverBack', this, function () {
    self.stepOverBack()
  })
  this.buttonNavigator.register('stepOverForward', this, function () {
    self.stepOverForward()
  })
  this.buttonNavigator.register('jumpNextCall', this, function () {
    self.jumpNextCall()
  })
}

StepManager.prototype.render = function () {
  return (
  yo`<div style=${ui.formatCss(style.container)}>
        ${this.slider.render()}
        ${this.buttonNavigator.render()}
      </div>`
  )
}

StepManager.prototype.reset = function () {
  this.slider.setValue(0)
  this.currentStepIndex = 0
  this.buttonNavigator.stepChanged(0)
}

StepManager.prototype.init = function () {
  this.slider.setValue(0)
  this.changeState(0)
}

StepManager.prototype.newTraceAvailable = function () {
  this.init()
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

StepManager.prototype.changeState = function (step) {
  this.currentStepIndex = step
  this.buttonNavigator.stepChanged(step)
  this.trigger('stepChanged', [step])
}

module.exports = StepManager
