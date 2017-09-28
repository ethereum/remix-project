'use strict'
var remix = require('ethereum-remix')
var SourceMappingDecoder = remix.util.SourceMappingDecoder
var AstWalker = remix.util.AstWalker
var EventManager = remix.lib.EventManager

/*
  trigger contextChanged(nodes)
*/
class ContextualListener {
  constructor (api, events) {
    this.event = new EventManager()
    this._api = api
    this._index = {
      Declarations: {},
      FlatReferences: {}
    }
    this._activeHighlights = []

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

    events.editor.register('contentChanged', () => { this._stopHighlighting() })

    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.astWalker = new AstWalker()
    setInterval(() => {
      this._highlightItems(api.getCursorPosition(), api.getCompilationResult(), api.getCurrentFile())
    }, 1000)
  }

  declarationOf (node) {
    if (node.attributes && node.attributes.referencedDeclaration) {
      return this._index['FlatReferences'][node.attributes.referencedDeclaration]
    }
    return null
  }

  referencesOf (node) {
    return this._index['Declarations'][node.id]
  }

  _highlightItems (cursorPosition, compilationResult, file) {
    if (this.currentPosition === cursorPosition) return
    if (this.currentFile !== file) {
      this.currentFile = file
      this.currentPosition = cursorPosition
      return
    }
    this._stopHighlighting()
    this.currentPosition = cursorPosition
    this.currentFile = file
    if (compilationResult && compilationResult.data && compilationResult.data.sources[file]) {
      var nodes = this.sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[file])
      this.event.trigger('contextChanged', [nodes])
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        this._highlightExpressions(nodes[nodes.length - 1], compilationResult)
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
      for (var s in compilationResult.sources) {
        this.astWalker.walk(compilationResult.sources[s].AST, callback)
      }
    }
  }

  _highlight (node, compilationResult) {
    if (!node) return
    var position = this.sourceMappingDecoder.decode(node.src)
    var eventId = this._api.highlight(position, node)
    if (eventId) {
      this._activeHighlights.push({ eventId, position, fileTarget: compilationResult.data.sourceList[position.file] })
    }
  }

  _highlightExpressions (node, compilationResult) {
    var self = this
    function highlights (id) {
      if (self._index['Declarations'] && self._index['Declarations'][id]) {
        var refs = self._index['Declarations'][id]
        for (var ref in refs) {
          var node = refs[ref]
          self._highlight(node, compilationResult)
        }
      }
    }
    if (node.attributes && node.attributes.referencedDeclaration) {
      highlights(node.attributes.referencedDeclaration)
      var current = this._index['FlatReferences'][node.attributes.referencedDeclaration]
      this._highlight(current, compilationResult)
    } else {
      highlights(node.id)
    }
  }

  _stopHighlighting () {
    for (var event in this._activeHighlights) {
      this._api.stopHighlighting(this._activeHighlights[event])
    }
    this._activeHighlights = []
  }
}

module.exports = ContextualListener
