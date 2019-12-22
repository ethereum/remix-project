'use strict'

const EventManager = require('../eventManager')
const helper = require('../helpers/traceHelper')

/**
  * allow to manage breakpoint
  *
  * Trigger events: breakpointHit, breakpointAdded, breakpointRemoved
  */
class BreakpointManager {
  /**
    * constructor
    *
    * @param {Object} _debugger - type of EthDebugger
    * @return {Function} _locationToRowConverter - function implemented by editor which return a column/line position for a char source location
    */
  constructor (_debugger, _locationToRowConverter, _jumpToCallback) {
    this.event = new EventManager()
    this.debugger = _debugger
    this.breakpoints = {}
    this.locationToRowConverter = _locationToRowConverter
    this.previousLine
    this.jumpToCallback = _jumpToCallback || (() => {})
  }

  /**
    * start looking for the next breakpoint
    * @param {Bool} defaultToLimit - if true jump to the end of the trace if no more breakpoint found
    *
    */
  async jumpNextBreakpoint (fromStep, defaultToLimit) {
    this.jump(fromStep || 0, 1, defaultToLimit)
  }

  /**
    * start looking for the previous breakpoint
    * @param {Bool} defaultToLimit - if true jump to the start of the trace if no more breakpoint found
    *
    */
  async jumpPreviousBreakpoint (fromStep, defaultToLimit) {
    this.jump(fromStep || 0, -1, defaultToLimit)
  }

   /**
    * start looking for the previous or next breakpoint
    * @param {Int} direction - 1 or -1 direction of the search
    * @param {Bool} defaultToLimit - if true jump to the limit (end if direction is 1, beginning if direction is -1) of the trace if no more breakpoint found
    *
    */
  async jump (fromStep, direction, defaultToLimit) {
    if (!this.locationToRowConverter) {
      console.log('row converter not provided')
      return
    }

    function depthChange (step, trace) {
      return trace[step].depth !== trace[step - 1].depth
    }

    function hitLine (currentStep, sourceLocation, previousSourceLocation, self) {
      // isJumpDestInstruction -> returning from a internal function call
      // depthChange -> returning from an external call
      // sourceLocation.start <= previousSourceLocation.start && ... -> previous src is contained in the current one
      if ((helper.isJumpDestInstruction(self.debugger.traceManager.trace[currentStep]) && previousSourceLocation.jump === 'o') ||
        depthChange(currentStep, self.debugger.traceManager.trace) ||
        (sourceLocation.start <= previousSourceLocation.start &&
        sourceLocation.start + sourceLocation.length >= previousSourceLocation.start + previousSourceLocation.length)) {
        return false
      } else {
        self.jumpToCallback(currentStep)
        self.event.trigger('breakpointHit', [sourceLocation, currentStep])
        return true
      }
    }

    let sourceLocation
    let previousSourceLocation
    let currentStep = fromStep + direction
    let lineHadBreakpoint = false
    while (currentStep > 0 && currentStep < this.debugger.traceManager.trace.length) {
      try {
        previousSourceLocation = sourceLocation
        sourceLocation = await this.debugger.callTree.extractSourceLocation(currentStep)
      } catch (e) {
        console.log('cannot jump to breakpoint ' + e)
        return
      }
      let lineColumn = this.locationToRowConverter(sourceLocation)
      if (this.previousLine !== lineColumn.start.line) {
        if (direction === -1 && lineHadBreakpoint) { // TODO : improve this when we will build the correct structure before hand
          lineHadBreakpoint = false
          if (hitLine(currentStep + 1, previousSourceLocation, sourceLocation, this)) {
            return
          }
        }
        this.previousLine = lineColumn.start.line
        if (this.hasBreakpointAtLine(sourceLocation.file, lineColumn.start.line)) {
          lineHadBreakpoint = true
          if (direction === 1) {
            if (hitLine(currentStep, sourceLocation, previousSourceLocation, this)) {
              return
            }
          }
        }
      }
      currentStep += direction
    }
    this.event.trigger('NoBreakpointHit', [])
    if (defaultToLimit) {
      if (direction === -1) {
        this.jumpToCallback(0)
      } else if (direction === 1) {
        this.jumpToCallback(this.debugger.traceManager.trace.length - 1)
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
  hasBreakpointAtLine (fileIndex, line) {
    const filename = this.debugger.solidityProxy.fileNameFromIndex(fileIndex)
    if (filename && this.breakpoints[filename]) {
      const sources = this.breakpoints[filename]
      for (let k in sources) {
        const source = sources[k]
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
    for (let k in this.breakpoints) {
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
    if (!this.breakpoints[sourceLocation.fileName]) {
      this.breakpoints[sourceLocation.fileName] = []
    }
    this.breakpoints[sourceLocation.fileName].push(sourceLocation)
    this.event.trigger('breakpointAdded', [sourceLocation])
  }

  /**
    * remove a breakpoint from the manager
    *
    * @param {Object} sourceLocation - position of the breakpoint { file: '<file index>', row: '<line number' }
    */
  remove (sourceLocation) {
    if (this.breakpoints[sourceLocation.fileName]) {
      var sources = this.breakpoints[sourceLocation.fileName]
      for (let k in sources) {
        const source = sources[k]
        if (sourceLocation.row === source.row) {
          sources.splice(k, 1)
          this.event.trigger('breakpointRemoved', [sourceLocation])
          break
        }
      }
    }
  }
}

module.exports = BreakpointManager
