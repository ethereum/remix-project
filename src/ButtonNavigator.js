'use strict'
var util = require('./helpers/global')
var EventManager = require('./lib/eventManager')
var yo = require('yo-yo')

function ButtonNavigator (_traceManager) {
  util.extend(this, new EventManager())
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
    <button ref='intoback' onclick=${function () { self.trigger('stepIntoBack') }} disabled=${this.intoBackDisabled} >
      Step Into Back
    </button>
    <button ref='overback' onclick=${function () { self.trigger('stepOverBack') }} disabled=${this.overBackDisabled} >
      Step Over Back
    </button>
    <button ref='overforward' onclick=${function () { self.trigger('stepOverForward') }} disabled=${this.overForwardDisabled} >
      Step Over Forward
    </button>
    <button ref='intoforward' onclick=${function () { self.trigger('stepIntoForward') }} disabled=${this.intoForwardDisabled} >
      Step Into Forward
    </button>
    <button ref='nextcall' onclick=${function () { self.trigger('jumpNextCall') }} disabled=${this.nextCallDisabled} >
      Jump Next Call
    </button>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

ButtonNavigator.prototype.stepChanged = function (step) {
  this.intoBackDisabled = step <= 0
  this.overBackDisabled = step <= 0
  if (!this.traceManager) {
    this.intoForwardDisabled = true
    this.overForwardDisabled = true
    this.NextCallDisabled = true
  } else {
    var self = this
    this.traceManager.getLength(function (error, length) {
      if (error) {
        self.intoBackDisabled = true
        self.overBackDisabled = true
        self.intoForwardDisabled = true
        self.overForwardDisabled = true
        self.NextcallDisabled = true
        console.log(error)
      } else {
        self.intoForwardDisabled = step >= length - 1
        self.overForwardDisabled = step >= length - 1
        self.nextCallDisabled = step >= length - 1
      }
    })
  }
  yo.update(this.view, this.render())
}

module.exports = ButtonNavigator
