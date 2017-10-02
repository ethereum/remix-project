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
      height            : 6em;
      border-color      : transparent;
      border-radius     : 3px;
      border            : .3px solid hsla(0, 0%, 40%, .2);
    }
  .container              {
    padding             : 1em;
  }
  .type                  {
    font-style        : italic;
    text-overflow     : ellipsis;
    width             : 18em;
    overflow          : hidden;
    white-space       : nowrap;
  }
  .name                  {
    font-weight       : bold;
    text-overflow     : ellipsis;
    width             : 18em;
    overflow          : hidden;
    white-space       : nowrap;
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
    this._current = null
    if (this._nodes && this._nodes.length) {
      var last = this._nodes[this._nodes.length - 1]
      if (isDefinition(last)) {
        this._current = last
      } else {
        var target = this._api.contextualListener.declarationOf(last)
        if (target) {
          this._current = target
        }
      }
    }
    return this._render(this._current)
  }

  _render (node) {
    if (!node) return yo`<div></div>`
    var references = this._api.contextualListener.referencesOf(node)
    var type = node.attributes.type ? node.attributes.type : node.name
    references = yo`<div>${references ? references.length : '0'} references</div>`
    return yo`<div>
      <div class=${css.type} >${type}</div>
      <div class=${css.name} >${node.attributes.name}</div>
      <div>${references}</div>
    </div>`
  }
}

function isDefinition (node) {
  return node.name === 'ContractDefinition' ||
  node.name === 'FunctionDefinition' ||
  node.name === 'ModifierDefinition' ||
  node.name === 'VariableDeclaration' ||
  node.name === 'StructDefinition'
}

module.exports = ContextView
