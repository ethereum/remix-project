'use strict'
var style = require('./styles/sliderStyles')
var EventManager = require('../lib/eventManager')
var yo = require('yo-yo')
var ui = require('../helpers/ui')

class Slider {
  constructor (_traceManager) {
    this.event = new EventManager()
    this.traceManager = _traceManager
    this.max
    this.disabled = true
    this.view

    this.previousValue = null
  }

  render () {
    var self = this
    var view = yo`<div>
        <input
          id='slider'
          style=${ui.formatCss(style.rule)}
          type='range'
          min=0
          max=${this.max}
          value=0
          onchange=${function () { self.onChange() }}
          oninput=${function () { self.onChange() }}
          disabled=${this.disabled} />
      </div>`
    if (!this.view) {
      this.view = view
    }
    return view
  }

  init (length) {
    var slider = document.getElementById('slider')
    slider.setAttribute('max', length - 1)
    this.max = length - 1
    this.updateDisabled(length === 0)
    this.disabled = length === 0
    this.setValue(0)
  }

  onChange (event) {
    var value = parseInt(document.getElementById('slider').value)
    if (value === this.previousValue) return
    this.previousValue = value
    this.event.trigger('moved', [value])
  }

  setValue (value) {
    var slider = document.getElementById('slider')
    var diff = value - slider.value
    if (diff > 0) {
      slider.stepUp(diff)
    } else {
      slider.stepDown(Math.abs(diff))
    }
  }

  updateDisabled (disabled) {
    if (disabled) {
      document.getElementById('slider').setAttribute('disabled', true)
    } else {
      document.getElementById('slider').removeAttribute('disabled')
    }
  }

  show () {
    this.view.style.display = 'block'
  }

  hide () {
    this.view.style.display = 'none'
  }
}

module.exports = Slider
