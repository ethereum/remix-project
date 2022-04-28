'use strict'
import { getLinebreakPositions, convertOffsetToLineColumn } from './sourceMappingDecoder'

export class OffsetToColumnConverter {
  lineBreakPositionsByContent
  sourceMappingDecoder

  constructor (compilerEvent) {
    this.lineBreakPositionsByContent = {}
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
    return convertOffsetToLineColumn(rawLocation, this.lineBreakPositionsByContent[file])
  }

  clear () {
    this.lineBreakPositionsByContent = {}
  }
}
