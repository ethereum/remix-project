var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var yo = require('yo-yo')

var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')

function StepManager (stepManager) {
  this.event = new EventManager()
  this.stepManager = stepManager
  this.startSlider()
  this.startButtonNavigator()
}

StepManager.prototype.startSlider = function () {
  const self = this

  this.slider = new Slider()
  this.slider.event.register('sliderMoved', self.stepManager.jumpTo.bind(this.stepManager))
  this.stepManager.event.register('traceLengthChanged', self.slider.setSliderLength.bind(this.slider))
}

StepManager.prototype.startButtonNavigator = function () {
  const self = this
  this.buttonNavigator = new ButtonNavigator()

  this.stepManager.event.register('revertWarning', self.buttonNavigator.resetWarning.bind(this.buttonNavigator))
  this.stepManager.event.register('stepChanged', self.updateStep.bind(this))

  this.buttonNavigator.event.register('stepIntoBack', self.stepManager.stepIntoBack.bind(this.stepManager))
  this.buttonNavigator.event.register('stepIntoForward', self.stepManager.stepIntoForward.bind(this.stepManager))
  this.buttonNavigator.event.register('stepOverBack', self.stepManager.stepOverBack.bind(this.stepManager))
  this.buttonNavigator.event.register('stepOverForward', self.stepManager.stepOverForward.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpOut', self.stepManager.jumpOut.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpToException', self.stepManager.jumpToException.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpNextBreakpoint', self.stepManager.jumpNextBreakpoint.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpPreviousBreakpoint', self.stepManager.jumpPreviousBreakpoint.bind(this.stepManager))
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
