'use strict'
var Slider = require('./Slider')
var utils = require('../helpers/util.js')

class SoliditySlider extends Slider {
  constructor (_traceManager, reducedTraceBySourceLocation) {
    super(_traceManager)
    this.reducedTraceBySourceLocation = reducedTraceBySourceLocation
  }
  setValue (value) {
    super.setValue(utils.findLowerBoundValue(value, this.reducedTraceBySourceLocation))
  }
}

module.exports = SoliditySlider
