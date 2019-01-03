var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

const EventManager = remixLib.EventManager

class PluginManagerApi {
  constructor (swapPanelComponent) {
    this.component = swapPanelComponent
  }

  /*
    viewTitle: string
    content: DOM element
  */
  addView(viewTitle, content) {
    // add the DOM to the swappanel
    this.component.addView(viewTitle, contents)
  }
}


module.exports = SwapPanelApi
