'use strict'
var yo = require('yo-yo')
var remixLib = require('remix-lib')
var SourceMappingDecoder = remixLib.SourceMappingDecoder
var globalRegistry = require('../../global/registry')

var css = require('./styles/contextView-styles')

/*
  Display information about the current focused code:
   - if it's a reference, display information about the declaration
   - jump to the declaration
   - number of references
   - rename declaration/references
*/
class ContextView {
  constructor (opts, localRegistry) {
    const self = this
    self._components = {}
    self._components.registry = localRegistry || globalRegistry
    self.contextualListener = opts.contextualListener
    self.editor = opts.editor
    self._deps = {
      compiler: self._components.registry.get('compiler').api,
      offsetToLineColumnConverter: self._components.registry.get('offsettolinecolumnconverter').api,
      config: self._components.registry.get('config').api,
      fileManager: self._components.registry.get('filemanager').api
    }
    this._view
    this._nodes
    this._current
    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.previousElement = null
    self.contextualListener.event.register('contextChanged', nodes => {
      this._nodes = nodes
      this.update()
    })
  }

  render () {
    var view = yo`<div class=${css.contextview}>
      <div class=${css.container}>
        ${this._renderTarget()}
      </div>
    </div>`
    if (!this._view) {
      this._view = view
      this.hide()
    }
    return view
  }

  hide () {
    if (this._view) {
      this._view.style.display = 'none'
    }
  }

  show () {
    if (this._view) {
      this._view.style.display = 'block'
    }
  }

  update () {
    if (this._view) {
      yo.update(this._view, this.render())
      this._view.style.display = this._current ? 'block' : 'none'
    }
  }

  _renderTarget () {
    var previous = this._current
    if (this._nodes && this._nodes.length) {
      var last = this._nodes[this._nodes.length - 1]
      if (isDefinition(last)) {
        this._current = last
      } else {
        var target = this.contextualListener.declarationOf(last)
        if (target) {
          this._current = target
        } else {
          this._current = null
        }
      }
    }
    if (!this._current || !previous || previous.id !== this._current.id) {
      this.previousElement = this._render(this._current, last)
    }
    return this.previousElement
  }

  _jumpToInternal (position) {
    var self = this
    function jumpToLine (lineColumn) {
      if (lineColumn.start && lineColumn.start.line && lineColumn.start.column) {
        self.editor.gotoLine(lineColumn.start.line, lineColumn.end.column + 1)
      }
    }
    if (self._deps.compiler.lastCompilationResult && self._deps.compiler.lastCompilationResult.data) {
      var lineColumn = self._deps.offsetToLineColumnConverter.offsetToLineColumn(position, position.file, self._deps.compiler.lastCompilationResult.source.sources)
      var filename = self._deps.compiler.getSourceName(position.file)
      // TODO: refactor with rendererAPI.errorClick
      if (filename !== self._deps.config.get('currentFile')) {
        var provider = self._deps.fileManager.fileProviderOf(filename)
        if (provider) {
          provider.exists(filename, (error, exist) => {
            if (error) return console.log(error)
            self._deps.fileManager.switchFile(filename)
            jumpToLine(lineColumn)
          })
        }
      } else {
        jumpToLine(lineColumn)
      }
    }
  }

  _render (node, nodeAtCursorPosition) {
    if (!node) return yo`<div></div>`
    var self = this
    var references = self.contextualListener.referencesOf(node)
    var type = (node.attributes && node.attributes.type) ? node.attributes.type : node.name
    references = `${references ? references.length : '0'} reference(s)`

    var ref = 0
    var nodes = self.contextualListener.getActiveHighlights()
    for (var k in nodes) {
      if (nodeAtCursorPosition.id === nodes[k].nodeId) {
        ref = k
        break
      }
    }

    // JUMP BETWEEN REFERENCES
    function jump (e) {
      e.target.dataset.action === 'next' ? ref++ : ref--
      if (ref < 0) ref = nodes.length - 1
      if (ref >= nodes.length) ref = 0
      self._jumpToInternal(nodes[ref].position)
    }

    function jumpTo () {
      if (node && node.src) {
        var position = self.sourceMappingDecoder.decode(node.src)
        if (position) {
          self._jumpToInternal(position)
        }
      }
    }

    return yo`<div class=${css.line}>
      <div title=${type} class=${css.type}>${type}</div>
      <div title=${node.attributes.name} class=${css.name}>${node.attributes.name}</div>
      <i class="fa fa-share ${css.jump}" aria-hidden="true" onclick=${jumpTo}></i>
      <span class=${css.referencesnb}>${references}</span>
      <i data-action='previous' class="fa fa-chevron-up ${css.jump}" aria-hidden="true" onclick=${jump}></i>
      <i data-action='next' class="fa fa-chevron-down ${css.jump}" aria-hidden="true" onclick=${jump}></i>
        ${showGasEstimation()}
    </div>`

    function showGasEstimation () {
      if (node.name === 'FunctionDefinition') {
        var result = self.contextualListener.gasEstimation(node)
        var executionCost = 'Execution cost: ' + result.executionCost + ' gas'
        var codeDepositCost = 'Code deposit cost: ' + result.codeDepositCost + ' gas'
        var estimatedGas = result.codeDepositCost ? `${codeDepositCost}, ${executionCost}` : `${executionCost}`
        return yo`<div class=${css.gasEstimation}>
        <img class=${css.gasStationIcon} title='Gas estimation' src='assets/img/gasStation_50.png'>
        ${estimatedGas}
        </div>`
      }
    }
  }
}

function isDefinition (node) {
  return node.name === 'ContractDefinition' ||
  node.name === 'FunctionDefinition' ||
  node.name === 'ModifierDefinition' ||
  node.name === 'VariableDeclaration' ||
  node.name === 'StructDefinition' ||
  node.name === 'EventDefinition'
}

module.exports = ContextView
