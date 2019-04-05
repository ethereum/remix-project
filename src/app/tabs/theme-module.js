import { ApiFactory } from 'remix-plugin'
import { EventEmitter } from 'events'
const Storage = require('remix-lib').Storage

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
  {name: 'Slate', quality: 'dark', url: 'https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/slate/bootstrap.min.css'},
  {name: 'Superhero', quality: 'dark', url: 'https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/superhero/bootstrap.min.css'}
]

export class ThemeModule extends ApiFactory {

  constructor () {
    super()
    this.events = new EventEmitter()
    this.storage = new Storage('style:')
    this.themes = themes.reduce(theme => ({ [theme.name]: theme }), {})
    this.active = this.storage.exists('theme') ? this.storage.get('theme') : 'Cerulean'
  }

  get profile () {
    return {
      name: 'theme',
      events: ['themeChanged'],
      methods: ['switchTheme', 'getThemes', 'currentTheme']
    }
  }

  /** Return the active theme */
  currentTheme () {
    return this.theme[this.active]
  }

  /** Returns all themes as an array */
  getThemes () {
    return Object.keys(this.themes).map(key => this.themes(key))
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
    this.storage.set('theme', next)
    document.getElementById('theme-link').setAttribute('href', nextTheme.url)
    document.documentElement.style.setProperty('--theme', nextTheme.quality)
    this.event.emit('switchTheme', nextTheme.quality)
  }
}
