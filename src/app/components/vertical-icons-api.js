var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

// API
class VerticalIconsApi {

  constructor(verticalIconsComponent, pluginManagerComponent) {
    this.component = verticalIconsComponent
    pluginManagerComponent.event.on('requestContainer', (mod, content) => verticalIconsComponent.addIcon(mod) )
  }  
}
module.exports = VerticalIconsApi
