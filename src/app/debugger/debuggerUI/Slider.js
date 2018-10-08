'use strict'
var EventManager = require('../../../lib/events')
var yo = require('yo-yo')

class Slider {
  constructor () {
    this.event = new EventManager()
    this.max
    this.disabled = true
    this.view
    this.previousValue = null
  }

  setSliderLength (length) {
    if (!this.view) return
    this.view.querySelector('#slider').setAttribute('max', length - 1)
    this.max = length - 1
    this.disabled = (length === 0)

    if (this.disabled) {
      this.view.querySelector('#slider').setAttribute('disabled', true)
    } else {
      this.view.querySelector('#slider').removeAttribute('disabled')
    }

    this.setValue(0)
  }

  onChange (event) {
    if (!this.view) return
    var value = parseInt(this.view.querySelector('#slider').value)
    if (value === this.previousValue) return

    this.previousValue = value
    this.event.trigger('sliderMoved', [value])
  }

  setValue (value) {
    if (!this.view) return
    this.view.querySelector('#slider').value = value
  }

  render () {
    var self = this
    var view = yo`<div>
        <input id='slider' style='width: 100%' type='range' min=0 max=${this.max} value=0
          onchange=${function () { self.onChange() }} oninput=${function () { self.onChange() }} disabled=${this.disabled} />
      </div>`
    if (!this.view) {
      this.view = view
    }
    return view
  }

}

module.exports = Slider
