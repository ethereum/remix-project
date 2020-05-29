'use strict'
var SourceMappingDecoder = require('remix-lib').SourceMappingDecoder
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../package.json'

const profile = {
  name: 'offsetToLineColumnConverter',
  methods: [],
  events: [],
  version: packageJson.version
}

export class OffsetToLineColumnConverter extends Plugin {
  constructor () {
    super(profile)
    this.lineBreakPositionsByContent = {}
    this.sourceMappingDecoder = new SourceMappingDecoder()
  }

  offsetToLineColumn (rawLocation, file, sources, asts) {
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

  clear () {
    this.lineBreakPositionsByContent = {}
  }

  activate () {
    this.on('solidity', 'compilationFinished', () => {
      this.clear()
    })
  }
}
