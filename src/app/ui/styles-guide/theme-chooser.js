var styleGuideLight = require('./style-guide')
var styleGuideDark = require('./styleGuideDark')
var styleGuideClean = require('./styleGuideClean')
var Storage = require('remix-lib').Storage

// Boostrap themes
// TODO : Put it somewhere else
const themes = {
  dark: 'https://bootstrap.themes.guide/darkster/theme.min.css',
  light: 'https://bootstrap.themes.guide/herbie/theme.min.css',
  clean: 'https://bootstrap.themes.guide/signal/theme.min.css'
}
// Used for the scroll color
const themeVariable = {
  dark: 'dark',
  light: 'light',
  clean: 'light'
}
module.exports = {

  chooser: function () {
    const themeStorage = new Storage('style:')
    if (themeStorage.exists('theme')) {
      if (themeStorage.get('theme') === 'dark') {
        document.getElementById('theme-link').setAttribute('href', themes['dark'])
        document.documentElement.style.setProperty('--theme', 'dark')
        return styleGuideDark()
      } else if (themeStorage.get('theme') === 'clean') {
        document.getElementById('theme-link').setAttribute('href', themes['clean'])
        document.documentElement.style.setProperty('--theme', 'light')
        return styleGuideClean()
      } else {
        document.getElementById('theme-link').setAttribute('href', themes['light'])
        document.documentElement.style.setProperty('--theme', 'light')
        return styleGuideLight()
      }
    } else {
      document.getElementById('theme-link').setAttribute('href', themes['light'])
      document.documentElement.style.setProperty('--theme', 'light')
      return styleGuideLight()
    }
  },

  switchTheme: function (theme) {
    var themeStorage = new Storage('style:')
    themeStorage.set('theme', theme)
    if (themes[theme]) {
      document.getElementById('theme-link').setAttribute('href', themes[theme])
      document.documentElement.style.setProperty('--theme', themeVariable[theme])
    }
    // if (theme === 'dark') {
    //   return styleGuideDark()
    // } else if (theme === 'light') {
    //   return styleGuideLight()
    // } else if (theme === 'clean') {
    //   return styleGuideClean()
    // } else {
    //   return styleGuideLight()
    // }
  }
}
