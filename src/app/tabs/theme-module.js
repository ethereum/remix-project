import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import * as packageJson from '../../../package.json'

const themes = [
  {name: 'Cerulean', quality: 'light', url: 'https://bootswatch.com/4/cerulean/bootstrap.min.css'},
  {name: 'Flatly', quality: 'light', url: 'https://bootswatch.com/4/flatly/bootstrap.min.css'},
  {name: 'Lumen', quality: 'light', url: 'https://bootswatch.com/4/lumen/bootstrap.min.css'},
  {name: 'Minty', quality: 'light', url: 'https://bootswatch.com/4/minty/bootstrap.min.css'},
  {name: 'Pulse', quality: 'light', url: 'https://bootswatch.com/4/pulse/bootstrap.min.css'},
  {name: 'Sandstone', quality: 'light', url: 'https://bootswatch.com/4/sandstone/bootstrap.min.css'},
  {name: 'Spacelab', quality: 'light', url: 'https://bootswatch.com/4/spacelab/bootstrap.min.css'},
  {name: 'Yeti', quality: 'light', url: 'https://bootswatch.com/4/yeti/bootstrap.min.css'},
  {name: 'Cyborg', quality: 'dark', url: 'https://bootswatch.com/4/cyborg/bootstrap.min.css'},
  {name: 'Darkly', quality: 'dark', url: 'https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/darkly/bootstrap.min.css'},
  {name: 'Slate', quality: 'light', url: 'https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/slate/bootstrap.min.css'},
  {name: 'Superhero', quality: 'dark', url: 'https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/superhero/bootstrap.min.css'}
]

const profile = {
  name: 'theme',
  events: ['themeChanged'],
  methods: ['switchTheme', 'getThemes', 'currentTheme'],
  version: packageJson.version
}

export class ThemeModule extends Plugin {

  constructor (registry) {
    super(profile)
    this.events = new EventEmitter()
    this._deps = {
      config: registry.get('config').api
    }
    this.themes = themes.reduce((acc, theme) => ({ ...acc, [theme.name]: theme }), {})
    this.active = this._deps.config.get('settings/theme') ? this._deps.config.get('settings/theme') : 'Flatly'
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
   * Change the current theme
   * @param {string} [themeName] - The name of the theme
   */
  switchTheme (themeName) {
    if (themeName && !Object.keys(this.themes).includes(themeName)) {
      throw new Error(`Theme ${themeName} doesn't exist`)
    }
    const next = themeName || this.active   // Name
    const nextTheme = this.themes[next] // Theme
    this._deps.config.set('settings/theme', next)
    document.getElementById('theme-link').setAttribute('href', nextTheme.url)
    document.documentElement.style.setProperty('--theme', nextTheme.quality)
    if (themeName) this.active = themeName
    this.events.emit('themeChanged', nextTheme)
  }
}
