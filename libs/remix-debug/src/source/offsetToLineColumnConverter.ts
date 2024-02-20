'use strict'
import { getLinebreakPositions, convertOffsetToLineColumn } from './sourceMappingDecoder'

export class OffsetToColumnConverter {
  lineBreakPositionsByContent
  sourceMappingDecoder
  offsetConversion

  constructor (compilerEvent) {
    this.lineBreakPositionsByContent = {}
    this.offsetConversion = {}
    if (compilerEvent) {
      compilerEvent.register('compilationFinished', (success, data, source, input, version) => {
        this.clear()
      })
    }
  }

  offsetToLineColumn (rawLocation, file, sources, asts) {
    if (!this.lineBreakPositionsByContent[file]) {
      for (const filename in asts) {
        const source = asts[filename]
        // source id was string before. in newer versions it has been changed to an integer so we need to check the type here
        if (typeof source.id === 'string') source.id = parseInt(source.id, 10)
        if (source.id === file) {
          this.lineBreakPositionsByContent[file] = getLinebreakPositions(sources[filename].content)
          break
        }
      }
    }
    const token = `${rawLocation.start}:${rawLocation.length}:${file}`
    if (this.offsetConversion[token]) {
      return this.offsetConversion[token]
    } else {
      const conversion = convertOffsetToLineColumn(rawLocation, this.lineBreakPositionsByContent[file])
      this.offsetConversion[token] = conversion
      return conversion
    }
  }

  clear () {
    this.lineBreakPositionsByContent = {}
    this.offsetConversion = {}
  }
}
