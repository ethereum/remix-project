var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

const EventEmmitter = require('events')

class SwapPanelApi {
  constructor (swapPanelComponent, verticalIconsComponent, pluginManagerComponent) {
    this.component = swapPanelComponent
    verticalIconsComponent.event.on('showContent', (moduleName) => {
      this.component.showContent(moduleName)
    })
    pluginManagerComponent.event.on('internalActivated', (mod, content) => {
      this.add(mod.name, content)
    })
  }

  /*
    content: DOM element
    by appManager
  */
  add (moduleName, content) {
    // add the DOM to the swappanel
    return this.component.add(moduleName, content)
  }

  reference (modulename, domElement) {
    this.nodes[modulename] = domElement
  }
}

module.exports = SwapPanelApi
