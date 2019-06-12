'use strict'
var SourceMappingDecoder = require('remix-lib').SourceMappingDecoder

function offsetToColumnConverter (appManager) {
  this.lineBreakPositionsByContent = {}
  this.sourceMappingDecoder = new SourceMappingDecoder()
  appManager.data.proxy.event.register('sendCompilationResult', () => {
    this.clear()
  })
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
