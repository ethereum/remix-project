// var yo = require('yo-yo')
// var csjs = require('csjs-inject')
// var remixLib = require('remix-lib')
//
// var EventManager = remixLib.EventManager
// var styles = remixLib.ui.themeChooser.chooser()
//
// module.exports = class TestTab {
//   constructor (opts = { api: {}, events: {} }) {
//     const self = this
//     self.event = new EventManager()
//     self._api = opts.api
//     self._events = opts.events
//     self._view = { el: null }
//     self.data = {}
//     self._components = {}
//   }
//   render () {
//     const self = this
//     if (self._view.el) return self._view.el
//     self._view.el = yo`
//       <div class=${css.testTab}>
//         Test Tab
//       </div>`
//     return self._view.el
//   }
// }
// const css = csjs`
//   .testTab         {
//     position       : relative;
//     box-sizing     : border-box;
//     display        : flex;
//     flex-direction : column;
//     align-items    : center;
//   }
// `

/*
.opts_li {
  display: block;
  font-weight: bold;
  color: ${styles.rightPanel.text_Teriary};
}
.opts_li.active {
  color: ${styles.rightPanel.text_Primary};
}
.opts_li:hover {
  color: ${styles.rightPanel.icon_HoverColor_TogglePanel};
}
.solIcon {
  margin-left: 10px;
  margin-right: 30px;
  display: flex;
  align-self: center;
  height: 29px;
  width: 20px;
  background-color: ${styles.colors.transparent};
}
a {
  color: ${styles.rightPanel.text_link};
}
#optionViews > div {
  display: none;
}
#optionViews .pre {
  word-wrap: break-word;
  background-color: ${styles.rightPanel.BackgroundColor_Pre};
  border-radius: 3px;
  display: inline-block;
  padding: 0 0.6em;
}
#optionViews .hide {
  display: none;
}
.infoBox  {
  ${styles.infoTextBox}
  margin-bottom: 1em;
}
.textBox  {
  ${styles.textBoxL}
  margin-bottom: 1em;
}
.icon {
  height: 70%;
  margin-right: 2%;
}
*/
