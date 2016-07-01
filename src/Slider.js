'use strict'
var style = require('./styles/sliderStyles')
var util = require('./helpers/global')
var EventManager = require('./lib/eventManager')
var yo = require('yo-yo')
var ui = require('./helpers/ui')

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
          onmouseup=${function () { self.onMouseUp() }}
          disabled=${this.disabled} />
      </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

Slider.prototype.init = function (length) {
  this.max = length
  this.disabled = length === 0
  yo.update(this.view, this.render())
  this.setValue(0)
}

Slider.prototype.onMouseUp = function (event) {
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

module.exports = Slider
