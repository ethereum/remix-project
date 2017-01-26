'use strict'
var Slider = require('./Slider')
var utils = require('../helpers/util.js')

class SoliditySlider extends Slider {
  constructor (_traceManager) {
    super(_traceManager)
    this.reducedTraceBySourceLocation
  }
  setValue (_value) {
    if (this.reducedTraceBySourceLocation) {
      super.setValue(utils.findLowerBound(_value, this.reducedTraceBySourceLocation))
    }
  }
  setReducedTrace (_reducedTraceBySourceLocation) {
    super.init(_reducedTraceBySourceLocation.length)
    this.reducedTraceBySourceLocation = _reducedTraceBySourceLocation
  }
}

module.exports = SoliditySlider
