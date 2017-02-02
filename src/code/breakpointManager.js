'use strict'
var EventManager = require('../lib/eventManager')

class breakpointManager {
  constructor (_debugger) {
    this.event = new EventManager()
    this.debugger = _debugger
    this.breakpoints = {}
    this.isPlaying = false
    this.breakpointHits = {}
  }

  async play () {
    if (this.hasBreakpoint()) {
      this.isPlaying = true
      var sourceLocation
      for (var currentStep = this.debugger.currentStepIndex; currentStep < this.debugger.traceManager.trace.length; currentStep++) {
        try {
          sourceLocation = await this.debugger.callTree.extractSourceLocation(currentStep)
        } catch (e) {
          console.log('cannot jump to breakpoint ' + e.message)
        }
        if (this.checkSourceLocation(sourceLocation)) {
          this.debugger.stepManager.jumpTo(currentStep)
          this.event.trigger('breakpointHit', [sourceLocation])
          break
        }
      }
    }
  }

  checkSourceLocation (sourceLocation) {
    if (this.breakpoints[sourceLocation.file]) {
      var sources = this.breakpoints[sourceLocation.file]
      for (var k in sources) {
        var source = sources[k]
        if (sourceLocation.start >= source.start &&
          sourceLocation.start < source.end &&
          (this.breakpointHits[source.file][source.row] === this.debugger.currentStepIndex || this.breakpointHits[source.file][source.row] === -1)) {
          this.breakpointHits[source.file][source.row] = this.debugger.currentStepIndex
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
    if (!this.breakpointHits[sourceLocation.file]) {
      this.breakpointHits[sourceLocation.file] = {}
    }
    this.breakpointHits[sourceLocation.file][sourceLocation.row] = -1
  }

  remove (sourceLocation) {
    if (this.breakpoints[sourceLocation.file]) {
      var sources = this.breakpoints[sourceLocation.file]
      for (var k in sources) {
        var source = sources[k]
        if (sourceLocation.start === source.start && sourceLocation.length === source.length) {
          sources.splice(k, 1)
          this.breakpointHits[sourceLocation.file][source.row] = undefined
          break
        }
      }
    }
  }
}

module.exports = breakpointManager
