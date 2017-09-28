'use strict'
var yo = require('yo-yo')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()
var csjs = require('csjs-inject')

var css = csjs`
  .contextview           {
      background-color  : ${styles.colors.backgroundBlue};
      opacity           : 0.8;
      width             : 20em;
      height            : 5em;
      border-color      : transparent;
      border-radius     : 3px;
      border            : .3px solid hsla(0, 0%, 40%, .2);
    }
`

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
    event.contextualListener.register('contextChanged', nodes => {
      this._nodes = nodes
      this.update()
    })
  }

  render () {
    var view = yo`<div class=${css.contextview}>
      <div>
        <span>${this._renderTarget()}</span>
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
    this._current = null
    if (this._nodes && this._nodes.length) {
      var last = this._nodes[this._nodes.length - 1]
      if (last.name === 'ContractDefinition' || last.name === 'FunctionDefinition' || last.name === 'ModifierDefinition' || last.name === 'VariableDeclaration') {
        this._current = last
      } else {
        var target = this._api.contextualListener.declarationOf(last)
        if (target) {
          this._current = target
        }
      }
    }
    return this._renderDeclarations(this._current)
  }

  _renderDeclarations (node) {
    if (!node) return yo`<div></div>`
    var references = this._api.contextualListener.referencesOf(node)
    references = yo`<div>${references ? references.length : '0'} references</div>`
    return yo`<div><div>${node.attributes.type} ${node.attributes.name} (${node.name})</div>
      <div>${references}</div>
    </div>`
  }
}

module.exports = ContextView
