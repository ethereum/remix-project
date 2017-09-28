'use strict'
var yo = require('yo-yo')
var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()
var csjs = require('csjs-inject')

var css = csjs`
  .contextview           {
      position          : absolute;
      background-color  : ${styles.colors.backgroundBlue};
      opacity           : 0.8;
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
    event.contextualListener.register('contextChanged', nodes => {
      this._nodes = nodes
      this.update()
    })
  }

  render () {
    var view = yo`<div class=${css.contextview}>
      <div>
        <span>${this._renderItems()}</span>
      </div>
    </div>`
    if (!this._view) {
      this._view = view
    }
    return view
  }

  update () {
    if (this._view) {
      yo.update(this._view, this.render())
    }
  }

  _renderItems () {
    if (this._nodes && this._nodes.length) {
      var last = this._nodes[this._nodes.length - 1]
      if (this._api.contextualListener.declarationOf(last)) {
        return renderReference(last)
      }
    }
    return yo``
  }
}



function renderReference (node) {
  yo`<div><span>${node.name}</span></div>`
}

module.exports = ContextView
