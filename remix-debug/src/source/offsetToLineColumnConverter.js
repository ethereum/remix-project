'use strict'
const SourceMappingDecoder = require('./sourceMappingDecoder')

function offsetToColumnConverter (compilerEvent) {
  this.lineBreakPositionsByContent = {}
  this.sourceMappingDecoder = new SourceMappingDecoder()
  var self = this
  if (compilerEvent) {
    compilerEvent.register('compilationFinished', (success, data, source) => {
      self.clear()
    })
  }
}

offsetToColumnConverter.prototype.offsetToLineColumn = function (rawLocation, file, sources, asts) {
  if (!this.lineBreakPositionsByContent[file]) {
    for (let filename in asts) {
      const source = asts[filename]
      // source id was string before. in newer versions it has been changed to an integer so we need to check the type here
      if (typeof source.id === 'string') source.id = parseInt(source.id, 10)
      if (source.id === file) {
        this.lineBreakPositionsByContent[file] = this.sourceMappingDecoder.getLinebreakPositions(sources[filename].content)
        break
      }
    }
  }
  return this.sourceMappingDecoder.convertOffsetToLineColumn(rawLocation, this.lineBreakPositionsByContent[file])
}

offsetToColumnConverter.prototype.clear = function () {
  this.lineBreakPositionsByContent = {}
}

module.exports = offsetToColumnConverter
