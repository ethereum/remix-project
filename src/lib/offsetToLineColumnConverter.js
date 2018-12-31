'use strict'
var SourceMappingDecoder = require('remix-lib').SourceMappingDecoder

function offsetToColumnConverter () {
  this.lineBreakPositionsByContent = {}
  this.sourceMappingDecoder = new SourceMappingDecoder()
  // we don't listen anymore on compilation result for clearing the cache
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
