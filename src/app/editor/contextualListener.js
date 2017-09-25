'use strict'
var SourceMappingDecoder = require('ethereum-remix').util.SourceMappingDecoder
var AstWalker = require('ethereum-remix').util.AstWalker

class ContextualListener {
  constructor (api, events) {
    this._api = api
    this._index = {
      Declarations: {},
      FlatReferences: {}
    }
    this._events = []

    events.compiler.register('compilationFinished', (success, data, source) => {
      this._stopHighlighting()
      this._index = {
        Declarations: {},
        FlatReferences: {}
      }
      if (success) {
        this._buildIndex(data, source)
      }
    })

    events.editor.register('sessionSwitched', () => { this._stopHighlighting() })
    events.editor.register('contentChanged', () => { this._stopHighlighting() })

    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.astWalker = new AstWalker()
    setInterval(() => {
      this._highlightItems(api.getCursorPosition(), api.getCompilationResult())
    }, 1000)
  }

  _highlightItems (cursorPosition, compilationResult) {
    if (this.currentPosition === cursorPosition) return
    this._stopHighlighting()
    this.currentPosition = cursorPosition
    if (compilationResult && compilationResult.data && compilationResult.source) {
      var nodes = this.sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[compilationResult.source.target])
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        this._hightlightExpressions(nodes[nodes.length - 1], compilationResult)
      }
    }
  }

  _buildIndex (compilationResult, source) {
    if (compilationResult && compilationResult.sources) {
      var self = this
      var callback = {}
      callback['*'] = function (node) {
        if (node && node.attributes && node.attributes.referencedDeclaration) {
          if (!self._index['Declarations'][node.attributes.referencedDeclaration]) {
            self._index['Declarations'][node.attributes.referencedDeclaration] = []
          }
          self._index['Declarations'][node.attributes.referencedDeclaration].push(node)
        }
        self._index['FlatReferences'][node.id] = node
        return true
      }
      this.astWalker.walk(compilationResult.sources[source.target].AST, callback)
    }
  }

  _highlight (node, compilationResult) {
    var src = node.src
    var position = this.sourceMappingDecoder.decode(src)
    var eventId = this._api.highlight(position, node)
    if (eventId) {
      this._events.push({ eventId, position, fileTarget: compilationResult.source.target })
    }
  }

  _hightlightExpressions (node, compilationResult) {
    var self = this
    function highlights (id) {
      if (self._index['Declarations'] && self._index['Declarations'][id]) {
        var calls = self._index['Declarations'][id]
        for (var call in calls) {
          var node = calls[call]
          self._highlight(node, compilationResult)
        }
      }
    }
    if (node.attributes && node.attributes.referencedDeclaration) {
      highlights(node.attributes.referencedDeclaration)
      var current = this._index['FlatReferences'][node.attributes.referencedDeclaration]
      this._highlight(current, compilationResult)
    } else if (node && node.name && node.name !== 'FunctionDefinition' && node.name !== 'ContractDefinition' && node.name !== 'Block') {
      highlights(node.id)
    }
  }

  _stopHighlighting () {
    for (var event in this._events) {
      this._api.stopHighlighting(this._events[event])
    }
    this._events = []
  }
}

module.exports = ContextualListener
