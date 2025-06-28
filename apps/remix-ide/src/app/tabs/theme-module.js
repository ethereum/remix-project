import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { QueryParams } from '@remix-project/remix-lib'
import * as packageJson from '../../../../../package.json'
import {Registry} from '@remix-project/remix-lib'
const isElectron = require('is-electron')
const _paq = window._paq = window._paq || []

//sol2uml dot files cannot work with css variables so hex values for colors are used
const themes = [
  { name: 'Dark', quality: 'dark', url: 'assets/css/themes/remix-dark_tvx1s2.css', backgroundColor: '#222336', textColor: '#babbcc',
    shapeColor: '#babbcc',fillColor: '#2a2c3f' },
  { name: 'Light', quality: 'light', url: 'assets/css/themes/remix-light_powaqg.css', backgroundColor: '#eef1f6', textColor: '#3b445e',
    shapeColor: '#343a40',fillColor: '#ffffff' },
  { name: 'Violet', quality: 'light', url: 'assets/css/themes/remix-violet.css', backgroundColor: '#f1eef6', textColor: '#3b445e',
    shapeColor: '#343a40',fillColor: '#f8fafe' },
  { name: 'Unicorn', quality: 'light', url: 'assets/css/themes/remix-unicorn.css', backgroundColor: '#f1eef6', textColor: '#343a40',
    shapeColor: '#343a40',fillColor: '#f8fafe' },
  { name: 'Midcentury', quality: 'light', url: 'assets/css/themes/remix-midcentury_hrzph3.css', backgroundColor: '#DBE2E0', textColor: '#11556c',
    shapeColor: '#343a40',fillColor: '#eeede9' },
  { name: 'Black', quality: 'dark', url: 'assets/css/themes/remix-black_undtds.css', backgroundColor: '#1a1a1a', textColor: '#babbcc',
    shapeColor: '#b5b4bc',fillColor: '#1f2020' },
  { name: 'Candy', quality: 'light', url: 'assets/css/themes/remix-candy_ikhg4m.css', backgroundColor: '#d5efff', textColor: '#11556c',
    shapeColor: '#343a40',fillColor: '#fbe7f8' },
  { name: 'HackerOwl', quality: 'dark', url: 'assets/css/themes/remix-hacker_owl.css', backgroundColor: '#011628', textColor: '#babbcc',
    shapeColor: '#8694a1',fillColor: '#011C32' },

  { name: 'Cerulean', quality: 'light', url: 'assets/css/themes/bootstrap-cerulean.min.css', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#343a40',fillColor: '#f8f9fa' },
  { name: 'Flatly', quality: 'light', url: 'assets/css/themes/bootstrap-flatly.min.css', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#7b8a8b',fillColor: '#ffffff' },
  { name: 'Spacelab', quality: 'light', url: 'assets/css/themes/bootstrap-spacelab.min.css', backgroundColor: '#ffffff', textColor: '#343a40',
    shapeColor: '#333333', fillColor: '#eeeeee' },
  { name: 'Cyborg', quality: 'dark', url: 'assets/css/themes/bootstrap-cyborg.min.css', backgroundColor: '#060606', textColor: '#adafae',
    shapeColor: '#adafae', fillColor: '#222222' }
]

const profile = {
  name: 'theme',
  events: ['themeChanged'],
  methods: ['switchTheme', 'getThemes', 'currentTheme', 'fixInvert'],
  version: packageJson.version,
  kind: 'theme'
}

export class ThemeModule extends Plugin {
  constructor() {
    super(profile)
    this.events = new EventEmitter()
    this._deps = {
      config: Registry.getInstance().get('config') && Registry.getInstance().get('config').api
    }
    this.themes = {}
    themes.map((theme) => {
      this.themes[theme.name.toLocaleLowerCase()] = {
        ...theme,
        url: isElectron()
          ? theme.url
          : window.location.pathname.startsWith('/auth')
            ? window.location.origin + '/' + theme.url
            : window.location.origin + (window.location.pathname.startsWith('/address/') || window.location.pathname.endsWith('.sol') ? '/' : window.location.pathname) + theme.url
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

  /** Return the active theme
   * @return {{ name: string, quality: string, url: string }} - The active theme
  */
  currentTheme() {
    if (isElectron()) {
      const theme = 'https://remix.ethereum.org/' + this.themes[this.active].url.replace(/\\/g, '/').replace(/\/\//g, '/').replace(/\/$/g, '')
      return { ...this.themes[this.active], url: theme }
    }
    return this.themes[this.active]
  }

  /** Returns all themes as an array */
  getThemes() {
    return Object.keys(this.themes).map(key => this.themes[key])
  }

  /**
   * Init the theme
   */
  initTheme(callback) { // callback is setTimeOut in app.js which is always passed
    if (callback) this.initCallback = callback
    if (this.active) {
      document.getElementById('theme-link') ? document.getElementById('theme-link').remove() : null
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
      //if (callback) callback()
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
    _paq.push(['trackEvent', 'themeModule', 'switchThemeTo', next])
    const nextTheme = this.themes[next] // Theme
    if (!this.forced) this._deps.config.set('settings/theme', next)
    document.getElementById('theme-link') ? document.getElementById('theme-link').remove() : null

    

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
    if (isElectron()) {
      const theme = 'https://remix.ethereum.org/' + nextTheme.url.replace(/\\/g, '/').replace(/\/\//g, '/').replace(/\/$/g, '')
      this.emit('themeChanged', { ...nextTheme, url: theme })
      this.events.emit('themeChanged', { ...nextTheme, url: theme })
    } else {
      this.emit('themeChanged', nextTheme)
      this.events.emit('themeChanged', nextTheme)
    }
  }

  /**
   * fixes the inversion for images since this should be adjusted when we switch between dark/light qualified themes
   * @param {element} [image] - the dom element which invert should be fixed to increase visibility
   */
  fixInvert(image) {
    const invert = this.currentTheme().quality === 'dark' ? 1 : 0
    if (image) {
      image.style.filter = `invert(${invert})`
    }
  }
}
