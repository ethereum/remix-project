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
    this.locationToRowConverter = _locationToRowConverter
    this.previousLine
  }

  /**
    * start looking for the next breakpoint
    * @param {Bool} defaultToLimit - if true jump to the enf of the trace if no more breakpoint found
    *
    */
  async jumpNextBreakpoint (defaultToLimit) {
    this.jump(1, defaultToLimit)
  }

  /**
    * start looking for the previous breakpoint
    * @param {Bool} defaultToLimit - if true jump to the enf of the trace if no more breakpoint found
    *
    */
  async jumpPreviousBreakpoint (defaultToLimit) {
    this.jump(-1, defaultToLimit)
  }

   /**
    * start looking for the previous or next breakpoint
    * @param {Int} direction - 1 or -1 direction of the search
    * @param {Bool} defaultToLimit - if true jump to the enf of the trace if no more breakpoint found
    *
    */
  async jump (direction, defaultToLimit) {
    if (!this.locationToRowConverter) {
      return
    }
    var sourceLocation
    var currentStep = this.debugger.currentStepIndex + direction
    while (currentStep > 0 && currentStep < this.debugger.traceManager.trace.length) {
      try {
        sourceLocation = await this.debugger.callTree.extractSourceLocation(currentStep)
      } catch (e) {
        console.log('cannot jump to breakpoint ' + e)
      }
      var lineColumn = this.locationToRowConverter(sourceLocation)
      if (this.previousLine !== lineColumn.start.line) {
        this.previousLine = lineColumn.start.line
        if (this.checkSourceLocation(sourceLocation.file, lineColumn.start.line)) {
          this.debugger.stepManager.jumpTo(currentStep)
          this.event.trigger('breakpointHit', [sourceLocation])
          break
        }
      }
      currentStep += direction
      if (defaultToLimit && (currentStep === this.debugger.traceManager.trace.length - 1 || currentStep === 0)) {
        this.debugger.stepManager.jumpTo(currentStep)
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
