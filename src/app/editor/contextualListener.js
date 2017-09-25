'use strict'
var SourceMappingDecoder = require('ethereum-remix').util.SourceMappingDecoder
var AstWalker = require('ethereum-remix').util.AstWalker

class ContextualListener {
  constructor (api, events) {
    this._api = api
    this._index = {
      ReferencedDeclarations: {},
      Expressions: []
    }
    this._events = []

    events.compiler.register('compilationFinished', (success, data, source) => {
      this._stopWarning()
      if (success) {
        this._buildIndex(data, source)
      } else {
        this._index = {
          ReferencedDeclarations: {},
          Expressions: []
        }
      }
    })
    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.astWalker = new AstWalker()
    setInterval(() => {
      this._warnExpressions(api.getCursorPosition(), api.getCompilationResult())
    }, 1000)
  }

  _warnExpressions (cursorPosition, compilationResult) {
    if (this.currentPosition === cursorPosition) return
    this._stopWarning()
    this.currentPosition = cursorPosition
    if (compilationResult && compilationResult.data && compilationResult.source) {
      var nodes = this.sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[compilationResult.source.target])
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        this._warnExpression(nodes[nodes.length - 1], compilationResult)
      }
    }
  }

  _buildIndex (compilationResult, source) {
    if (compilationResult && compilationResult.sources) {
      var self = this
      var callback = {}
      callback['*'] = function (node) {
        if (node && node.attributes && node.attributes.referencedDeclaration) {
          if (!self._index['ReferencedDeclarations'][node.attributes.referencedDeclaration]) {
            self._index['ReferencedDeclarations'][node.attributes.referencedDeclaration] = []
          }
          self._index['ReferencedDeclarations'][node.attributes.referencedDeclaration].push(node)
          self._index['Expressions'].push(node)
        }
        return true
      }
      this.astWalker.walk(compilationResult.sources[source.target].AST, callback)
    }
  }

  _warnExpression (node, compilationResult) {
    var self = this
    function highlight (id) {
      if (self._index['ReferencedDeclarations'] && self._index['ReferencedDeclarations'][id]) {
        var calls = self._index['ReferencedDeclarations'][id]
        for (var call in calls) {
          self._warn(calls[call].src, compilationResult)
        }
      }
    }

    if (node.attributes && node.attributes.referencedDeclaration) {
      highlight(node.attributes.referencedDeclaration)
    } else {
      highlight(node.id)
    }
  }

  _warn (src, compilationResult) {
    var position = this.sourceMappingDecoder.decode(src)
    var eventId = this._api.warnExpression(position)
    this._events.push({ eventId, position, fileTarget: compilationResult.source.target })
  }

  _stopWarning () {
    for (var event in this._events) {
      this._api.stopWarningExpression(this._events[event])
    }
    this._events = []
  }
}

module.exports = ContextualListener
