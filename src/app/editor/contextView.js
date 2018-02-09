'use strict'
var yo = require('yo-yo')
var remixLib = require('remix-lib')
var SourceMappingDecoder = remixLib.SourceMappingDecoder

var css = require('./styles/contextView-styles')

/*
  Display information about the current focused code:
   - if it's a reference, display information about the declaration
   - jump to the declaration
   - number of references
   - rename declaration/references
*/
class ContextView {
  constructor (api, event) {
    this._api = api
    this._event = event
    this._view
    this._nodes
    this._current
    this.sourceMappingDecoder = new SourceMappingDecoder()
    this.previousElement = null
    event.contextualListener.register('contextChanged', nodes => {
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
        var target = this._api.contextualListener.declarationOf(last)
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

  _render (node, nodeAtCursorPosition) {
    if (!node) return yo`<div></div>`
    var self = this
    var references = this._api.contextualListener.referencesOf(node)
    var type = (node.attributes && node.attributes.type) ? node.attributes.type : node.name
    references = `${references ? references.length : '0'} reference(s)`

    var ref = 0
    var nodes = self._api.contextualListener.getActiveHighlights()
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
      self._api.jumpTo(nodes[ref].position)
    }

    function jumpTo () {
      if (node && node.src) {
        var position = self.sourceMappingDecoder.decode(node.src)
        if (position) {
          self._api.jumpTo(position)
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
        var result = self._api.contextualListener.gasEstimation(node)
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
