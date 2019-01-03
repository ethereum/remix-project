
var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()
  
  // Component
  class VerticalIconComponent {
  
    constructor(appManager) {
      this.appManager = appManager
      appManager.event.register('activated', (item) => {
        this.addIcon(item)
      })
      appManager.event.register('deactivated', (item) => {
        this.removeIcon(item)
      })
    }
  
    addIcon (item) {

    }

    removeIcon (item) {

    }

    render() {
        yo`
          <div id='plugins' class=${css.plugins} >
            <h3>example</h3>
          </div>
        `
    }
  }

  module.exports = VerticalIconComponent
