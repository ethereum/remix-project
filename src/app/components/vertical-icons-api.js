var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

// API
class VerticalIconsApi {

  constructor(verticalIconsComponent) {
    this.component = verticalIconsComponent
  }

  addIcon(icon) {
    this.component.event.trigger('addIcon', icon)
  }

  removeIcon(icon) {
    this.component.event.trigger('removeIcon', icon)
  }
}
module.exports = VerticalIconsApi
