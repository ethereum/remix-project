'use strict'
var remixLib = require('remix-lib')
var SourceMappingDecoder = remixLib.SourceMappingDecoder
var AstWalker = remixLib.AstWalker
var EventManager = remixLib.EventManager
var globalRegistry = require('../../global/registry')

/*
  trigger contextChanged(nodes)
*/
class ContextualListener {
  constructor (opts, localRegistry) {
    var self = this
    this.event = new EventManager()
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self.editor = opts.editor
    self._deps = {
      compiler: self._components.registry.get('compiler').api,
      config: self._components.registry.get('config').api,
      offsetToLineColumnConverter: self._components.registry.get('offsettolinecolumnconverter').api
    }
    this._index = {
      Declarations: {},
      FlatReferences: {}
    }
    this._activeHighlights = []

    self._deps.compiler.event.register('compilationFinished', (success, data, source) => {
      this._stopHighlighting()
      this._index = {
        Declarations: {},
        FlatReferences: {}
      }
      if (success) {
        this._buildIndex(data, source)
      }
    })

    self.editor.event.register('contentChanged', () => { this._stopHighlighting() })

    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.astWalker = new AstWalker()
    setInterval(() => {
      this._highlightItems(self.editor.getCursorPosition(), self._deps.compiler.lastCompilationResult, self._deps.config.get('currentFile'))
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
    var self = this
    var position = this.sourceMappingDecoder.decode(node.src)
    var eventId = this._highlightInternal(position, node)
    if (eventId) {
      this._activeHighlights.push({ eventId, position, fileTarget: self._deps.compiler.getSourceName(position.file), nodeId: node.id })
    }
  }

  _highlightInternal (position, node) {
    var self = this
    if (self._deps.compiler.lastCompilationResult && self._deps.compiler.lastCompilationResult.data) {
      var lineColumn = self._deps.offsetToLineColumnConverter.offsetToLineColumn(position, position.file, self._deps.compiler.lastCompilationResult.source.sources)
      var css = 'highlightreference'
      if (node.children && node.children.length) {
        // If node has children, highlight the entire line. if not, just highlight the current source position of the node.
        css = 'highlightreference'
        lineColumn = {
          start: {
            line: lineColumn.start.line,
            column: 0
          },
          end: {
            line: lineColumn.start.line + 1,
            column: 0
          }
        }
      }
      var fileName = self._deps.compiler.getSourceName(position.file)
      if (fileName) {
        return self.editor.addMarker(lineColumn, fileName, css)
      }
    }
    return null
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
    var self = this
    for (var eventKey in this._activeHighlights) {
      var event = this._activeHighlights[eventKey]
      self.editor.removeMarker(event.eventId, event.fileTarget)
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
