var remixLib = require('remix-lib')
// var Storage = require('./storage')
// var styleGuide = remixLib.ui.styleGuide
var styleGuideDark = remixLib.ui.styleGuideDark

// if (storage.get("theme") == 'dark') {
//   return styleGuideDark
// } else {
//   return styleGuide
// }

function chooser (theme) {
  return theme
}

chooser(styleGuideDark)
