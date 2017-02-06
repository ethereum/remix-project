'use strict'
var EventManager = require('../lib/eventManager')

/**
  * allow to manage breakpoint
  *
  * Trigger events: breakpointHit, breakpointAdded, breakpointRemoved
  */
class breakpointManager {
  /**
    * constructor
    *
    * @param {Object} _debugger - type of EthDebugger
    * @return {Function} _locationToRowConverter - function implemented by editor which return a column/line position for a char source location
    */
  constructor (_debugger, _locationToRowConverter) {
    this.event = new EventManager()
    this.debugger = _debugger
    this.breakpoints = {}
    this.isPlaying = false
    this.locationToRowConverter = _locationToRowConverter
    this.currentLine
  }

  /**
    * start looking for the next breakpoint
    *
    */
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
      if (this.checkSourceLocation(sourceLocation.file, this.currentLine)) {
        this.debugger.stepManager.jumpTo(currentStep)
        this.event.trigger('breakpointHit', [sourceLocation])
        break
      }
    }
  }

  /**
    * check the given pair fileIndex/line against registered breakpoints
    *
    * @param {Int} fileIndex - index of the file content (from the compilation result)
    * @param {Int} line - line number where looking for breakpoint
    * @return {Bool} return true if the given @arg fileIndex @arg line refers to a breakpoint
    */
  checkSourceLocation (fileIndex, line) {
    if (this.breakpoints[fileIndex]) {
      var sources = this.breakpoints[fileIndex]
      for (var k in sources) {
        var source = sources[k]
        if (line === source.row) {
          return true
        }
      }
    }
    return false
  }

  /**
    * return true if current manager has breakpoint
    *
    * @return {Bool} true if breapoint registered
    */
  hasBreakpoint () {
    for (var k in this.breakpoints) {
      if (this.breakpoints[k].length) {
        return true
      }
    }
    return false
  }

  /**
    * add a new breakpoint to the manager
    *
    * @param {Object} sourceLocation - position of the breakpoint { file: '<file index>', row: '<line number' }
    */
  add (sourceLocation) {
    if (!this.breakpoints[sourceLocation.file]) {
      this.breakpoints[sourceLocation.file] = []
    }
    this.breakpoints[sourceLocation.file].push(sourceLocation)
    this.event.trigger('breakpointAdded', [sourceLocation])
  }

  /**
    * remove a breakpoint from the manager
    *
    * @param {Object} sourceLocation - position of the breakpoint { file: '<file index>', row: '<line number' }
    */
  remove (sourceLocation) {
    if (this.breakpoints[sourceLocation.file]) {
      var sources = this.breakpoints[sourceLocation.file]
      for (var k in sources) {
        var source = sources[k]
        if (sourceLocation.row === source.row) {
          sources.splice(k, 1)
          this.event.trigger('breakpointRemoved', [sourceLocation])
          break
        }
      }
    }
  }
}

module.exports = breakpointManager
