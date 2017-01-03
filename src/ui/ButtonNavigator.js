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
  this.jumpOutDisabled = true

  this.traceManager = _traceManager

  this.view
}

module.exports = ButtonNavigator

ButtonNavigator.prototype.render = function () {
  var self = this
  var view = yo`<div>    
    <button id='overback' title='step over back' class='fa fa-angle-double-left' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepOverBack') }} disabled=${this.overBackDisabled} >
    </button>
    <button id='intoback' title='step into back' class='fa fa-angle-left' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepIntoBack') }} disabled=${this.intoBackDisabled} >
    </button>    
    <button id='intoforward' title='step into forward'  class='fa fa-angle-right' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepIntoForward') }} disabled=${this.intoForwardDisabled} >
    </button>
    <button id='overforward' title='step over forward' class='fa fa-angle-double-right' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('stepOverForward') }} disabled=${this.overForwardDisabled} >
    </button>    
    <button id='nextcall'  title='step next call' class='fa fa-chevron-right' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('jumpNextCall') }} disabled=${this.nextCallDisabled} >
    </button>
    <button id='jumpout' title='jump out' class='fa fa-share' style=${ui.formatCss(style.button)} onclick=${function () { self.event.trigger('jumpOut') }} disabled=${this.jumpOutDisabled} >
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
  this.jumpOutDisabled = true
}

ButtonNavigator.prototype.stepChanged = function (step) {
  this.intoBackDisabled = step <= 0
  this.overBackDisabled = step <= 0
  this.jumpOutDisabled = step <= 0
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
  this.updateDisabled('jumpout', this.jumpOutDisabled)
}

ButtonNavigator.prototype.updateDisabled = function (id, disabled) {
  if (disabled) {
    document.getElementById(id).setAttribute('disabled', true)
  } else {
    document.getElementById(id).removeAttribute('disabled')
  }
}

module.exports = ButtonNavigator
