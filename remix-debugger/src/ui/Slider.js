'use strict'
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var yo = require('yo-yo')

class Slider {
  constructor (_traceManager, _stepOverride) {
    this.event = new EventManager()
    this.traceManager = _traceManager
    this.max
    this.disabled = true
    this.view
    this.solidityMode = false
    this.stepOverride = _stepOverride

    this.previousValue = null
  }

  render () {
    var self = this
    var view = yo`<div>
        <input
          id='slider'
          style='width: 100%'
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
    if (this.stepOverride) {
      var correctedValue = this.stepOverride(value)
      if (correctedValue !== value) {
        this.setValue(correctedValue)
        value = correctedValue
      }
    }
    if (value === this.previousValue) return
    this.previousValue = value
    this.event.trigger('moved', [value])
  }

  setValue (value) {
    this.view.querySelector('#slider').value = value
  }

  updateDisabled (disabled) {
    if (disabled) {
      this.view.querySelector('#slider').setAttribute('disabled', true)
    } else {
      this.view.querySelector('#slider').removeAttribute('disabled')
    }
  }
}

module.exports = Slider
