var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var yo = require('yo-yo')

var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')

function StepManager (_debugger) {
  this.event = new EventManager()
  this.step_manager = _debugger.step_manager
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
