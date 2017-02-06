'use strict'
var EventManager = require('../lib/eventManager')

class breakpointManager {
  constructor (_debugger, _locationToRowConverter) {
    this.event = new EventManager()
    this.debugger = _debugger
    this.breakpoints = {}
    this.isPlaying = false
    this.locationToRowConverter = _locationToRowConverter
    this.currentLine
  }

  async play () {
    this.isPlaying = true
    var sourceLocation
    for (var currentStep = this.debugger.currentStepIndex + 1; currentStep < this.debugger.traceManager.trace.length; currentStep++) {
      try {
        sourceLocation = await this.debugger.callTree.extractSourceLocation(currentStep)
      } catch (e) {
        console.log('cannot jump to breakpoint ' + e.message)
      }
      if (this.locationToRowConverter) {
        var lineColumn = this.locationToRowConverter(sourceLocation)
        if (this.currentLine === lineColumn.start.line) {
          continue
        }
        this.currentLine = lineColumn.start.line
      }
      if (this.checkSourceLocation(sourceLocation, currentStep, this.currentLine)) {
        this.debugger.stepManager.jumpTo(currentStep)
        this.event.trigger('breakpointHit', [sourceLocation])
        break
      }
    }
  }

  checkSourceLocation (sourceLocation, currentStep, currentLine) {
    if (this.breakpoints[sourceLocation.file]) {
      var sources = this.breakpoints[sourceLocation.file]
      for (var k in sources) {
        var source = sources[k]
        if (currentLine === source.row) {
          return true
        }
      }
    }
    return false
  }

  hasBreakpoint () {
    for (var k in this.breakpoints) {
      if (this.breakpoints[k].length) {
        return true
      }
    }
    return false
  }

  add (sourceLocation) {
    if (!this.breakpoints[sourceLocation.file]) {
      this.breakpoints[sourceLocation.file] = []
    }
    this.breakpoints[sourceLocation.file].push(sourceLocation)
  }

  remove (sourceLocation) {
    if (this.breakpoints[sourceLocation.file]) {
      var sources = this.breakpoints[sourceLocation.file]
      for (var k in sources) {
        var source = sources[k]
        if (sourceLocation.start === source.start && sourceLocation.length === source.length) {
          sources.splice(k, 1)
          break
        }
      }
    }
  }
}

module.exports = breakpointManager
