'use strict'
var remixLib = require('remix-lib')
var SourceMappingDecoder = remixLib.SourceMappingDecoder
var AstWalker = remixLib.AstWalker
var EventManager = remixLib.EventManager

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

  getActiveHighlights () {
    return [...this._activeHighlights]
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
      this.nodes = nodes
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        this._highlightExpressions(nodes[nodes.length - 1], compilationResult)
      }
      this.event.trigger('contextChanged', [nodes])
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
        this.astWalker.walk(compilationResult.sources[s].legacyAST, callback)
      }
    }
  }

  _highlight (node, compilationResult) {
    if (!node) return
    var position = this.sourceMappingDecoder.decode(node.src)
    var eventId = this._api.highlight(position, node)
    if (eventId) {
      this._activeHighlights.push({ eventId, position, fileTarget: this._api.getSourceName(position.file), nodeId: node.id })
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
      this._highlight(node, compilationResult)
    }
    this.results = compilationResult
  }

  _stopHighlighting () {
    for (var event in this._activeHighlights) {
      this._api.stopHighlighting(this._activeHighlights[event])
    }
    this._activeHighlights = []
  }

  gasEstimation (node) {
    this._loadContractInfos(node)
    var executionCost
    var codeDepositCost
    if (node.name === 'FunctionDefinition') {
      var visibility = node.attributes.visibility
      if (!node.attributes.isConstructor) {
        var fnName = node.attributes.name
        var fn = fnName + this._getInputParams(node)
        if (visibility === 'public' || visibility === 'external') {
          executionCost = this.estimationObj.external[fn]
        } else if (visibility === 'private' || visibility === 'internal') {
          executionCost = this.estimationObj.internal[fn]
        }
      } else {
        executionCost = this.creationCost
        codeDepositCost = this.codeDepositCost
      }
    } else {
      executionCost = '-'
    }
    return {executionCost, codeDepositCost}
  }

  _loadContractInfos (node) {
    for (var i in this.nodes) {
      if (this.nodes[i].id === node.attributes.scope) {
        var contract = this.nodes[i]
        this.contract = this.results.data.contracts[this.results.source.target][contract.attributes.name]
        this.estimationObj = this.contract.evm.gasEstimates
        this.creationCost = this.estimationObj.creation.totalCost
        this.codeDepositCost = this.estimationObj.creation.codeDepositCost
      }
    }
  }

  _getInputParams (node) {
    var params = []
    for (var i in node.children) {
      if (node.children[i].name === 'ParameterList') {
        var target = node.children[i]
        break
      }
    }
    if (target) {
      var children = target.children
      for (var j in children) {
        if (children[j].name === 'VariableDeclaration') {
          params.push(children[j].attributes.type)
        }
      }
    }
    return '(' + params.toString() + ')'
  }
}

module.exports = ContextualListener
