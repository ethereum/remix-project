'use strict'
const remixLib = require('remix-lib')
const SourceMappingDecoder = remixLib.SourceMappingDecoder
const AstWalker = remixLib.AstWalker
const EventManager = require('../../lib/events')
const globalRegistry = require('../../global/registry')

/*
  trigger contextChanged(nodes)
*/
class ContextualListener {
  constructor (opts, localRegistry) {
    this.event = new EventManager()
    this._components = {}
    this._components.registry = localRegistry || globalRegistry
    this.editor = opts.editor
    this.pluginManager = opts.pluginManager
    this._deps = {
      compilersArtefacts: this._components.registry.get('compilersartefacts').api,
      config: this._components.registry.get('config').api,
      offsetToLineColumnConverter: this._components.registry.get('offsettolinecolumnconverter').api
    }
    this._index = {
      Declarations: {},
      FlatReferences: {}
    }
    this._activeHighlights = []

    this.pluginManager.event.register('sendCompilationResult', (file, source, languageVersion, data) => {
      if (languageVersion.indexOf('soljson') !== 0) return
      this._stopHighlighting()
      this._index = {
        Declarations: {},
        FlatReferences: {}
      }
      this._buildIndex(data, source)
    })

    this.editor.event.register('contentChanged', () => { this._stopHighlighting() })

    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.astWalker = new AstWalker()
    setInterval(() => {
      if (this._deps.compilersArtefacts['__last'] && this._deps.compilersArtefacts['__last'].languageversion.indexOf('soljson') === 0) {
        this._highlightItems(this.editor.getCursorPosition(), this._deps.compilersArtefacts['__last'], this._deps.config.get('currentFile'))
      }
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
      const nodes = this.sourceMappingDecoder.nodesAtPosition(null, cursorPosition, compilationResult.data.sources[file])
      this.nodes = nodes
      if (nodes && nodes.length && nodes[nodes.length - 1]) {
        this._highlightExpressions(nodes[nodes.length - 1], compilationResult)
      }
      this.event.trigger('contextChanged', [nodes])
    }
  }

  _buildIndex (compilationResult, source) {
    if (compilationResult && compilationResult.sources) {
      const callback = {}
      callback['*'] = (node) => {
        if (node && node.attributes && node.attributes.referencedDeclaration) {
          if (!this._index['Declarations'][node.attributes.referencedDeclaration]) {
            this._index['Declarations'][node.attributes.referencedDeclaration] = []
          }
          this._index['Declarations'][node.attributes.referencedDeclaration].push(node)
        }
        this._index['FlatReferences'][node.id] = node
        return true
      }
      for (const s in compilationResult.sources) {
        this.astWalker.walk(compilationResult.sources[s].legacyAST, callback)
      }
    }
  }

  _highlight (node, compilationResult) {
    if (!node) return
    const position = this.sourceMappingDecoder.decode(node.src)
    const eventId = this._highlightInternal(position, node)
    let lastCompilationResult = this._deps.compilersArtefacts['__last']
    if (eventId && lastCompilationResult && lastCompilationResult.languageversion.indexOf('soljson') === 0) {
      this._activeHighlights.push({ eventId, position, fileTarget: lastCompilationResult.getSourceName(position.file), nodeId: node.id })
    }
  }

  _highlightInternal (position, node) {
    let lastCompilationResult = this._deps.compilersArtefacts['__last']
    if (lastCompilationResult && lastCompilationResult.languageversion.indexOf('soljson') === 0) {
      let lineColumn = this._deps.offsetToLineColumnConverter.offsetToLineColumn(position, position.file, lastCompilationResult.getSourceCode().sources, lastCompilationResult.getAsts())
      let css = 'highlightreference'
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
      const fileName = lastCompilationResult.getSourceName(position.file)
      if (fileName) {
        return this.editor.addMarker(lineColumn, fileName, css)
      }
    }
    return null
  }

  _highlightExpressions (node, compilationResult) {
    const highlights = (id) => {
      if (this._index['Declarations'] && this._index['Declarations'][id]) {
        const refs = this._index['Declarations'][id]
        for (const ref in refs) {
          const node = refs[ref]
          this._highlight(node, compilationResult)
        }
      }
    }
    if (node.attributes && node.attributes.referencedDeclaration) {
      highlights(node.attributes.referencedDeclaration)
      const current = this._index['FlatReferences'][node.attributes.referencedDeclaration]
      this._highlight(current, compilationResult)
    } else {
      highlights(node.id)
      this._highlight(node, compilationResult)
    }
    this.results = compilationResult
  }

  _stopHighlighting () {
    for (const eventKey in this._activeHighlights) {
      const event = this._activeHighlights[eventKey]
      this.editor.removeMarker(event.eventId, event.fileTarget)
    }
    this.event.trigger('stopHighlighting', [])
    this._activeHighlights = []
  }

  gasEstimation (node) {
    this._loadContractInfos(node)
    let executionCost, codeDepositCost
    if (node.name === 'FunctionDefinition') {
      const visibility = node.attributes.visibility
      if (!node.attributes.isConstructor) {
        const fnName = node.attributes.name
        const fn = fnName + this._getInputParams(node)
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
    for (const i in this.nodes) {
      if (this.nodes[i].id === node.attributes.scope) {
        const contract = this.nodes[i]
        this.contract = this.results.data.contracts[this.results.source.target][contract.attributes.name]
        this.estimationObj = this.contract.evm.gasEstimates
        this.creationCost = this.estimationObj.creation.totalCost
        this.codeDepositCost = this.estimationObj.creation.codeDepositCost
      }
    }
  }

  _getInputParams (node) {
    const params = []
    let target
    for (const i in node.children) {
      if (node.children[i].name === 'ParameterList') {
        target = node.children[i]
        break
      }
    }
    if (target) {
      const children = target.children
      for (const j in children) {
        if (children[j].name === 'VariableDeclaration') {
          params.push(children[j].attributes.type)
        }
      }
    }
    return '(' + params.toString() + ')'
  }
}

module.exports = ContextualListener
