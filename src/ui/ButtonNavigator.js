'use strict'
var EventManager = require('../lib/eventManager')
var style = require('./styles/basicStyles')
var ui = require('../helpers/ui')
var yo = require('yo-yo')

function ButtonNavigator (_traceManager) {
  this.event = new EventManager()
  this.intoBackDisabled = true
  this.overBackDisabled = true
  this.intoForwardDisabled = true
  this.overForwardDisabled = true
  this.nextCallDisabled = true

  this.traceManager = _traceManager

  this.view
}

module.exports = ButtonNavigator

ButtonNavigator.prototype.render = function () {
  var self = this
  var view = yo`<div>    
    <button id='overback' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepOverBack') }} disabled=${this.overBackDisabled} >
      Step Over Back
    </button>
    <button id='intoback' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepIntoBack') }} disabled=${this.intoBackDisabled} >
      Step Into Back
    </button>    
    <button id='intoforward' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepIntoForward') }} disabled=${this.intoForwardDisabled} >
      Step Into Forward
    </button>
    <button id='overforward' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepOverForward') }} disabled=${this.overForwardDisabled} >
      Step Over Forward
    </button>
    <button id='nextcall' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('jumpNextCall') }} disabled=${this.nextCallDisabled} >
      Jump Next Call
    </button>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

ButtonNavigator.prototype.reset = function () {
  this.intoBackDisabled = true
  this.overBackDisabled = true
  this.intoForwardDisabled = true
  this.overForwardDisabled = true
  this.nextCallDisabled = true
}

ButtonNavigator.prototype.stepChanged = function (step) {
  this.intoBackDisabled = step <= 0
  this.overBackDisabled = step <= 0
  if (!this.traceManager) {
    this.intoForwardDisabled = true
    this.overForwardDisabled = true
    this.nextCallDisabled = true
  } else {
    var self = this
    this.traceManager.getLength(function (error, length) {
      if (error) {
        self.reset()
        console.log(error)
      } else {
        self.intoForwardDisabled = step >= length - 1
        self.overForwardDisabled = step >= length - 1
        self.nextCallDisabled = step >= length - 1
      }
      self.updateAll()
    })
  }
  this.updateAll()
}

ButtonNavigator.prototype.updateAll = function () {
  this.updateDisabled('intoback', this.intoBackDisabled)
  this.updateDisabled('overback', this.overBackDisabled)
  this.updateDisabled('overforward', this.overForwardDisabled)
  this.updateDisabled('intoforward', this.intoForwardDisabled)
  this.updateDisabled('nextcall', this.nextCallDisabled)
}

ButtonNavigator.prototype.updateDisabled = function (id, disabled) {
  if (disabled) {
    document.getElementById(id).setAttribute('disabled', true)
  } else {
    document.getElementById(id).removeAttribute('disabled')
  }
}

module.exports = ButtonNavigator
