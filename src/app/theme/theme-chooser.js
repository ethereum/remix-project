var remixLib = require('remix-lib')
var styleGuideLight = remixLib.ui.styleGuide
var styleGuideDark = remixLib.ui.styleGuideDark
var Storage = require('../../storage')
module.exports = {

  chooser: function () {
    var themeStorage = new Storage('style:')
    if (themeStorage.get('theme') === 'light') {
      return styleGuideLight()
    } else {
      return styleGuideDark()
    }
  },

  switchTheme: function (theme) {
    var themeStorage = new Storage('style:')
    themeStorage.set('theme', theme)
    if (theme === 'dark') {
      return styleGuideDark()
    } else if (theme === 'light') {
      return styleGuideLight()
    } else {
      return styleGuideLight()
    }
  }
}
