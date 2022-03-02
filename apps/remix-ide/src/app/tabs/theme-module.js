import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { QueryParams } from '@remix-project/remix-lib'
import * as packageJson from '../../../../../package.json'
import Registry from '../state/registry'
const _paq = window._paq = window._paq || []

const themes = [
  { name: 'Dark', quality: 'dark', url: 'assets/css/themes/remix-dark_tvx1s2.css' },
  { name: 'Light', quality: 'light', url: 'assets/css/themes/remix-light_powaqg.css' },
  { name: 'Midcentury', quality: 'light', url: 'assets/css/themes/remix-midcentury_hrzph3.css' },
  { name: 'Black', quality: 'dark', url: 'assets/css/themes/remix-black_undtds.css' },
  { name: 'Candy', quality: 'light', url: 'assets/css/themes/remix-candy_ikhg4m.css' },

  { name: 'Cerulean', quality: 'light', url: 'assets/css/themes/bootstrap-cerulean.min.css' },
  { name: 'Flatly', quality: 'light', url: 'assets/css/themes/bootstrap-flatly.min.css' },
  { name: 'Spacelab', quality: 'light', url: 'assets/css/themes/bootstrap-spacelab.min.css' },
  { name: 'Cyborg', quality: 'dark', url: 'assets/css/themes/bootstrap-cyborg.min.css' }
]

const profile = {
  name: 'theme',
  events: ['themeChanged'],
  methods: ['switchTheme', 'getThemes', 'currentTheme', 'fixInvert'],
  version: packageJson.version,
  kind: 'theme'
}

export class ThemeModule extends Plugin {
  constructor () {
    super(profile)
    this.events = new EventEmitter()
    this._deps = {
      config: Registry.getInstance().get('config') && Registry.getInstance().get('config').api
    }
    this.themes = {}
    themes.map((theme) => {
      this.themes[theme.name.toLocaleLowerCase()] = {
       ...theme,
        url: window.location.origin + window.location.pathname + theme.url
      }
    })
    this._paq = _paq
    let queryTheme = (new QueryParams()).get().theme
    queryTheme = queryTheme && queryTheme.toLocaleLowerCase()
    queryTheme = this.themes[queryTheme] ? queryTheme : null
    let currentTheme = (this._deps.config && this._deps.config.get('settings/theme')) || null
    currentTheme = currentTheme && currentTheme.toLocaleLowerCase()
    currentTheme = this.themes[currentTheme] ? currentTheme : null
    this.currentThemeState = { queryTheme, currentTheme }
    this.active = queryTheme || currentTheme || 'dark'
    this.forced = !!queryTheme
  }

  /** Return the active theme */
  currentTheme () {
    return this.themes[this.active]
  }

  /** Returns all themes as an array */
  getThemes () {
    return Object.keys(this.themes).map(key => this.themes[key])
  }

  /**
   * Init the theme
   */
  initTheme (callback) { // callback is setTimeOut in app.js which is always passed
    if (callback) this.initCallback = callback
    if (this.active) {
      document.getElementById('theme-link') ? document.getElementById('theme-link').remove():null
      const nextTheme = this.themes[this.active] // Theme
      document.documentElement.style.setProperty('--theme', nextTheme.quality)

      const theme = document.createElement('link')
      theme.setAttribute('rel', 'stylesheet')
      theme.setAttribute('href', nextTheme.url)
      theme.setAttribute('id', 'theme-link')
      theme.addEventListener('load', () => {
        if (callback) callback()
      })
      document.head.insertBefore(theme, document.head.firstChild)
    }
  }

  /**
   * Change the current theme
   * @param {string} [themeName] - The name of the theme
   */
  switchTheme (themeName) {
    themeName = themeName && themeName.toLocaleLowerCase() 
    if (themeName && !Object.keys(this.themes).includes(themeName)) {
      throw new Error(`Theme ${themeName} doesn't exist`)
    }
    const next = themeName || this.active // Name
    if (next === this.active) return // --> exit out of this method
    _paq.push(['trackEvent', 'themeModule', 'switchTo', next])
    const nextTheme = this.themes[next] // Theme
    if (!this.forced) this._deps.config.set('settings/theme', next)
    document.getElementById('theme-link') ? document.getElementById('theme-link').remove():null

    const theme = document.createElement('link')
    theme.setAttribute('rel', 'stylesheet')
    theme.setAttribute('href', nextTheme.url)
    theme.setAttribute('id', 'theme-link')
    theme.addEventListener('load', () => {
      this.emit('themeLoaded', nextTheme)
      this.events.emit('themeLoaded', nextTheme)
    })
    document.head.insertBefore(theme, document.head.firstChild)
    document.documentElement.style.setProperty('--theme', nextTheme.quality)
    if (themeName) this.active = themeName
    // TODO: Only keep `this.emit` (issue#2210)
    this.emit('themeChanged', nextTheme)
    this.events.emit('themeChanged', nextTheme)
  }

  /**
   * fixes the invertion for images since this should be adjusted when we switch between dark/light qualified themes
   * @param {element} [image] - the dom element which invert should be fixed to increase visibility
   */
  fixInvert (image) {
    const invert = this.currentTheme().quality === 'dark' ? 1 : 0
    if (image) {
      image.style.filter = `invert(${invert})`
    }
  }
}
