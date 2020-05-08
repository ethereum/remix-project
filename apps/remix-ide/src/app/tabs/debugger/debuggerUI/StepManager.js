var EventManager = require('../../../../lib/events')
var yo = require('yo-yo')

var ButtonNavigator = require('./ButtonNavigator')
var Slider = require('./Slider')

function StepManager (stepManager) {
  this.event = new EventManager()
  this.stepManager = stepManager
  this.startSlider()
  this.startButtonNavigator()
  this.stepManager.event.register('stepChanged', this.updateStep.bind(this))
}

StepManager.prototype.startSlider = function () {
  this.slider = new Slider()
  this.slider.event.register('sliderMoved', this.stepManager.jumpTo.bind(this.stepManager))
  this.stepManager.event.register('traceLengthChanged', this.slider.setSliderLength.bind(this.slider))
}

StepManager.prototype.startButtonNavigator = function () {
  this.buttonNavigator = new ButtonNavigator()

  this.stepManager.event.register('revertWarning', this.buttonNavigator.resetWarning.bind(this.buttonNavigator))

  this.buttonNavigator.event.register('stepIntoBack', this.stepManager.stepIntoBack.bind(this.stepManager))
  this.buttonNavigator.event.register('stepIntoForward', this.stepManager.stepIntoForward.bind(this.stepManager))
  this.buttonNavigator.event.register('stepOverBack', this.stepManager.stepOverBack.bind(this.stepManager))
  this.buttonNavigator.event.register('stepOverForward', this.stepManager.stepOverForward.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpOut', this.stepManager.jumpOut.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpToException', this.stepManager.jumpToException.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpNextBreakpoint', this.stepManager.jumpNextBreakpoint.bind(this.stepManager))
  this.buttonNavigator.event.register('jumpPreviousBreakpoint', this.stepManager.jumpPreviousBreakpoint.bind(this.stepManager))
}

StepManager.prototype.updateStep = function (step, stepState, jumpOutDisabled) {
  if (!this.slider) return
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
