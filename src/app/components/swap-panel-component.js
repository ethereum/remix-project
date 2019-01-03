var yo = require('yo-yo')
var csjs = require('csjs-inject')
const remixLib = require('remix-lib')

const styleguide = require('../ui/styles-guide/theme-chooser')
const styles = styleguide.chooser()

const EventManager = remixLib.EventManager

class SwapPanelComponent {
  constructor () {
  }

  showContent (moduleName) {
    // hiding the current view and display the `moduleName`
  }

  addView (title, content) {
    // add the DOM to the swappanel
  }

  render () {
    var self = this

    var view = yo`
      <div id='plugins' class=${css.plugins} >
        <div class=${css.plugItIn} >
            <h1> Plugin 1 </h1>
            <ul> <li> Some Text </li> </ul>
        </div>
        <div class=${css.plugItIn} >
            <h1> Plugin 2 </h1>
            <ul> <li> Some Text </li> </ul>
        </div>
        <div class=${css.plugItIn} >
            <h1> Plugin 3 </h1>
            <ul> <li> Some Text </li> </ul>
        </div>
      </div>
    `
  }
}

module.exports = SwapPanelComponent

const css = csjs`
  .plugins        {
    width          : 300px;
  }
  .plugItIn       {
    display        : none;
  }
  .plugItIn.active     {
    display        :block;
  }
  .clearFunds { background-color: lightblue; }
`
