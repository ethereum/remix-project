'use strict'
var style = require('./styles/sliderStyles')
var util = require('../helpers/global')
var EventManager = require('../lib/eventManager')
var yo = require('yo-yo')
var ui = require('../helpers/ui')

function Slider (_traceManager) {
  util.extend(this, new EventManager())
  this.traceManager = _traceManager
  this.max
  this.disabled = true
  this.view
}

Slider.prototype.render = function () {
  var self = this
  var view = yo`<div>
        <input
          id='slider'
          style=${ui.formatCss(style.rule)}
          type='range'
          min=0
          max=${this.max}
          value=0
          onkeyup=${function () { self.onChange() }}
          onmouseup=${function () { self.onChange() }}
          disabled=${this.disabled} />
      </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

Slider.prototype.init = function (length) {
  var slider = document.getElementById('slider')
  slider.setAttribute('max', length - 1)
  this.max = length - 1
  this.updateDisabled(length === 0)
  this.disabled = length === 0
  this.setValue(0)
}

Slider.prototype.onChange = function (event) {
  var value = document.getElementById('slider').value
  this.trigger('moved', [parseInt(value)])
}

Slider.prototype.setValue = function (value) {
  var slider = document.getElementById('slider')
  var diff = value - slider.value
  if (diff > 0) {
    slider.stepUp(diff)
  } else {
    slider.stepDown(Math.abs(diff))
  }
}

Slider.prototype.updateDisabled = function (disabled) {
  if (disabled) {
    document.getElementById('slider').setAttribute('disabled', true)
  } else {
    document.getElementById('slider').removeAttribute('disabled')
  }
}

module.exports = Slider
