'use strict'
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.styleGuide
var styles = styleGuide()
var SourceMappingDecoder = remixLib.SourceMappingDecoder

var css = csjs`
  .contextview            {
      opacity           : 0.8;
    }
  .container              {
    padding             : 1px 15px;
  }
  .line                   {
    display             : flex;
    justify-content     : flex-end;
    align-items         : center;
    text-overflow       : ellipsis;
    overflow            : hidden;
    white-space         : nowrap;
    color               : ${styles.editor.text_Primary};
    font-size           : 11px;
  }
  .type                   {
    font-style        : italic;
    margin-right      : 5px;
  }
  .name                   {
    font-weight       : bold;
    margin-right      : 15px;
    cursor            : pointer;
  }
  .jump                   {
    cursor            : pointer;
    margin            : 0 5px;
    color             : ${styles.editor.icon_Color_Editor};
  }
  .jump:hover              {
    color             : ${styles.editor.icon_HoverColor_Editor};
  }
  .referencesnb           {
    float             : right;
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
    this.sourceMappingDecoder = new SourceMappingDecoder()
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
    console.log('rendering')
    if (!node) return yo`<div></div>`
    var self = this
    var references = this._api.contextualListener.referencesOf(node)
    var type = node.attributes.type ? node.attributes.type : node.name
    references = `${references ? references.length : '0'} reference(s)`

    function jumpTo () {
      if (node && node.src) {
        var position = self.sourceMappingDecoder.decode(node.src)
        if (position) {
          self._api.jumpTo(position)
        }
      }
    }

    function next () {
      var currentName = node.attributes.name
      if (currentName === this.refName) {
        this.ref = this.ref === undefined ? 0 : this.ref
      } else { this.ref = 0 }
      var nodes = self._api.contextualListener.getActiveHighlights()
      self._api.jumpTo(nodes[this.ref].position)
      this.ref = (this.ref + 1) % nodes.length
      this.refName = currentName
    }

    function previous () {
      var currentName = node.attributes.name
      if (currentName === this.refName) {
        this.ref = this.ref === undefined ? 0 : this.ref
      } else { this.ref = 0 }  // should be this.ref = ref of the selected node (loop through all nodes to find this one)
      var nodes = self._api.contextualListener.getActiveHighlights()
      this.ref = this.ref === undefined ? 0 : this.ref
      self._api.jumpTo(nodes[nodes.length - 1 - this.ref].position)
      this.ref = (this.ref + 1) % nodes.length
      this.refName = currentName
    }

    return yo`<div class=${css.line}>
      <i class="fa fa-share ${css.jump}" aria-hidden="true" onclick=${jumpTo}></i>
      <div title=${type} class=${css.type}>${type}</div>
      <div title=${node.attributes.name} class=${css.name}>${node.attributes.name}</div>
      <span class=${css.referencesnb}>${references}</span>
      <i class="fa fa-chevron-up ${css.jump}" aria-hidden="true" onclick=${previous}></i>
      <i class="fa fa-chevron-down ${css.jump}" aria-hidden="true" onclick=${next}></i>
    </div>`
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
