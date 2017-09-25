'use strict'
var SourceMappingDecoder = require('ethereum-remix').util.SourceMappingDecoder
var AstWalker = require('ethereum-remix').util.AstWalker

class ContextualListener {
  constructor (api, events) {
    this._api = api
    this._index = {
      FunctionDefinition: {},
      FunctionCalls: {},
      FunctionCall: {}
    }
    this._events = []

    events.compiler.register('compilationFinished', (success, data, source) => {
      this._stopWarning()
      if (success) {
        this._buildIndex(data, source)
      } else {
        this._index = {
          FunctionDefinition: {},
          FunctionCalls: {},
          FunctionCall: {}
        }
      }
    })
    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.astWalker = new AstWalker()
    setInterval(() => {
      this._context(api.getCursorPosition(), api.getCompilationResult())
    }, 1000)
  }

  _context (cursorPosition, compilationResult) {
    if (this.currentPosition === cursorPosition) return
    this._stopWarning()
    this.currentPosition = cursorPosition
    if (compilationResult && compilationResult.data && compilationResult.source) {
      var nodes = this.sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[compilationResult.source.target])
      if (nodes && nodes['FunctionCall']) {
        this._highlightFunctionCall(nodes['FunctionCall'], compilationResult)
      }
    }
  }

  _buildIndex (compilationResult, source) {
    if (compilationResult && compilationResult.sources) {
      var self = this
      var callback = {}
      callback['*'] = function (node) {
        if (node && node.name && self._index[node.name]) {
          self._index[node.name][node.id] = node
          if (node.name === 'FunctionCall' && node.children[0] && node.children[0].attributes) {
            var declaration = node.children[0].attributes.referencedDeclaration
            if (!self._index['FunctionCalls'][declaration]) self._index['FunctionCalls'][declaration] = []
            self._index['FunctionCalls'][declaration].push(node.id)
          }
        }
        return true
      }
      this.astWalker.walk(compilationResult.sources[source.target].AST, callback)
    }
  }

  _highlightFunctionCall (node, compilationResult) {
    if (node.name === 'FunctionCall' && node.children[0] && node.children[0].attributes) {
      var calls = this._index['FunctionCalls'][node.children[0].attributes.referencedDeclaration]
      for (var call in calls) {
        var position = this.sourceMappingDecoder.decode(this._index['FunctionCall'][calls[call]].src)
        var eventId = this._api.warnFoundCall(position)
        this._events.push({ eventId, position, fileTarget: compilationResult.source.target })
      }
    }
  }

  _stopWarning () {
    for (var event in this._events) {
      this._api.stopFoundCall(this._events[event])
    }
    this._events = []
  }
}

module.exports = ContextualListener
