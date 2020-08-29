const util = require('./util')

function offsetToColumnConverter (compilerEvent) {
  this.lineBreakPositionsByContent = {}
  if (compilerEvent) {
    compilerEvent.register('compilationFinished', (success, data, source) => {
      this.clear()
    })
  }
}

/**
  * Retrieve line/column position of each source char
  *
  * @param {String} source - contract source code
  * @return {Array} returns an array containing offset of line breaks
  */
offsetToColumnConverter.prototype.getLinebreakPositions = function (source) {
  const ret = []
  for (let pos = source.indexOf('\n'); pos >= 0; pos = source.indexOf('\n', pos + 1)) {
    ret.push(pos)
  }
  return ret
}

/**
 * Retrieve the line/column position for the given source mapping
 *
 * @param {Object} sourceLocation - object containing attributes {source} and {length}
 * @param {Array} lineBreakPositions - array returned by the function 'getLinebreakPositions'
 * @return {Object} returns an object {start: {line, column}, end: {line, column}} (line/column count start at 0)
 */
offsetToColumnConverter.prototype.convertOffsetToLineColumn = function (sourceLocation, lineBreakPositions) {
  if (sourceLocation.start >= 0 && sourceLocation.length >= 0) {
    return {
      start: convertFromCharPosition(sourceLocation.start, lineBreakPositions),
      end: convertFromCharPosition(sourceLocation.start + sourceLocation.length, lineBreakPositions)
    }
  }
  return {start: null, end: null}
}

function convertFromCharPosition (pos, lineBreakPositions) {
  let line = util.findLowerBound(pos, lineBreakPositions)
  if (lineBreakPositions[line] !== pos) {
    line = line + 1
  }
  const beginColumn = line === 0 ? 0 : (lineBreakPositions[line - 1] + 1)
  const column = pos - beginColumn
  return {line, column}
}

offsetToColumnConverter.prototype.offsetToLineColumn = function (rawLocation, file, sources, asts) {
  if (!this.lineBreakPositionsByContent[file]) {
    for (let filename in asts) {
      const source = asts[filename]
      // source id was string before. in newer versions it has been changed to an integer so we need to check the type here
      if (typeof source.id === 'string') source.id = parseInt(source.id, 10)
      if (source.id === file) {
        this.lineBreakPositionsByContent[file] = this.getLinebreakPositions(sources[filename].content)
        break
      }
    }
  }
  return this.convertOffsetToLineColumn(rawLocation, this.lineBreakPositionsByContent[file])
}

offsetToColumnConverter.prototype.clear = function () {
  this.lineBreakPositionsByContent = {}
}

module.exports = offsetToColumnConverter
