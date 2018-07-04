'use strict'
var SourceMappingDecoder = require('remix-lib').SourceMappingDecoder

function offsetToColumnConverter (compilerEvent) {
  this.lineBreakPositionsByContent = {}
  this.sourceMappingDecoder = new SourceMappingDecoder()
  var self = this
  compilerEvent.register('compilationFinished', function (success, data, source) {
    self.clear()
  })
}

offsetToColumnConverter.prototype.offsetToLineColumn = function (rawLocation, file, sources) {
  if (!this.lineBreakPositionsByContent[file]) {
    var filename = Object.keys(sources)[file]
    this.lineBreakPositionsByContent[file] = this.sourceMappingDecoder.getLinebreakPositions(sources[filename].content)
  }
  return this.sourceMappingDecoder.convertOffsetToLineColumn(rawLocation, this.lineBreakPositionsByContent[file])
}

offsetToColumnConverter.prototype.clear = function () {
  this.lineBreakPositionsByContent = {}
}

module.exports = offsetToColumnConverter
