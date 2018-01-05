var remixLib = require('remix-lib')
var styleGuideLight = remixLib.ui.styleGuide
var styleGuideDark = remixLib.ui.styleGuideDark
var Storage = require('../../storage')
module.exports = {

  chooser: function () {
    var themeStorage = new Storage('style:')
    if (themeStorage.exists('theme')) {
      console.log('10! ' + themeStorage.exists('theme'))
      // console.log('lll ' + )
      if (themeStorage.get('theme') === 'dark') {
        return styleGuideDark()
      } else {
        return styleGuideLight()
      }
    } else {
      console.log('17! ' + themeStorage.exists('style:'))
      return styleGuideLight()
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
