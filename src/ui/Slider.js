'use strict'
var style = require('./styles/sliderStyles')
var EventManager = require('../lib/eventManager')
var yo = require('yo-yo')
var utils = require('../helpers/util.js')
var ui = require('../helpers/ui')

class Slider {
  constructor (_traceManager) {
    this.event = new EventManager()
    this.traceManager = _traceManager
    this.max
    this.disabled = true
    this.view
    this.solidityMode = false

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
    var slider = this.view.querySelector('#slider')
    slider.setAttribute('max', length - 1)
    this.max = length - 1
    this.updateDisabled(length === 0)
    this.disabled = length === 0
    this.setValue(0)
  }

  onChange (event) {
    var value = parseInt(this.view.querySelector('#slider').value)
    if (this.solidityMode) {
      value = utils.findLowerBound(value, this.reducedTrace)
      this.view.querySelector('#slider').value = value
    }
    if (value === this.previousValue) return
    this.previousValue = value
    this.event.trigger('moved', [value])
  }

  setValue (value) {
    var slider = this.view.querySelector('#slider')
    var diff = value - slider.value
    if (diff > 0) {
      slider.stepUp(diff)
    } else {
      slider.stepDown(Math.abs(diff))
    }
  }

  setReducedTrace (trace) {
    this.reducedTrace = trace
  }

  setSolidityMode (mode) {
    this.solidityMode = false
  }

  updateDisabled (disabled) {
    if (disabled) {
      this.view.querySelector('#slider').setAttribute('disabled', true)
    } else {
      this.view.querySelector('#slider').removeAttribute('disabled')
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
