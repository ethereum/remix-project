'use strict'
var SourceMappingDecoder = require('./sourceMappingDecoder')

function offsetToColumnConverter (compilerEvent) {
  this.lineBreakPositionsByContent = {}
  this.sourceMappingDecoder = new SourceMappingDecoder()
  var self = this
  if (compilerEvent) {
    compilerEvent.register('compilationFinished', function (success, data, source) {
      self.clear()
    })
  }
}

offsetToColumnConverter.prototype.offsetToLineColumn = function (rawLocation, file, sources, asts) {
  if (!this.lineBreakPositionsByContent[file]) {
    for (var filename in asts) {
      var source = asts[filename]
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
