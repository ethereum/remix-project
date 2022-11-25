import { Plugin } from '@remixproject/engine'
import { EventEmitter } from 'events'
import { QueryParams } from '@remix-project/remix-lib'
import * as packageJson from '../../../../../package.json'
import Registry from '../state/registry'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'
const _paq = window._paq = window._paq || []

const locales = [
  { name: 'en-US', messages: enUS },
  { name: 'zh-CN', messages: zhCN },
]

const profile = {
  name: 'locale',
  events: ['localeChanged'],
  methods: ['switchLocale', 'getLocales', 'currentLocale'],
  version: packageJson.version,
  kind: 'locale'
}

export class LocaleModule extends Plugin {
  constructor () {
    super(profile)
    this.events = new EventEmitter()
    this._deps = {
      config: Registry.getInstance().get('config') && Registry.getInstance().get('config').api
    }
    this.locales = {}
    locales.map((locale) => {
      this.locales[locale.name.toLocaleLowerCase()] = locale
    })
    this._paq = _paq
    let queryLocale = (new QueryParams()).get().locale
    queryLocale = queryLocale && queryLocale.toLocaleLowerCase()
    queryLocale = this.locales[queryLocale] ? queryLocale : null
    let currentLocale = (this._deps.config && this._deps.config.get('settings/locale')) || null
    currentLocale = currentLocale && currentLocale.toLocaleLowerCase()
    currentLocale = this.locales[currentLocale] ? currentLocale : null
    this.currentLocaleState = { queryLocale, currentLocale }
    this.active = queryLocale || currentLocale || 'en-us'
    this.forced = !!queryLocale
  }

  /** Return the active locale */
  currentLocale () {
    return this.locales[this.active]
  }

  /** Returns all locales as an array */
  getLocales () {
    return Object.keys(this.locales).map(key => this.locales[key])
  }

  /**
   * Change the current locale
   * @param {string} [localeName] - The name of the locale
   */
  switchLocale (localeName) {
    localeName = localeName && localeName.toLocaleLowerCase()
    if (localeName && !Object.keys(this.locales).includes(localeName)) {
      throw new Error(`Locale ${localeName} doesn't exist`)
    }
    const next = localeName || this.active // Name
    if (next === this.active) return // --> exit out of this method
    _paq.push(['trackEvent', 'localeModule', 'switchTo', next])
    const nextLocale = this.locales[next] // Locale
    if (!this.forced) this._deps.config.set('settings/locale', next)

    if (localeName) this.active = localeName
    this.emit('localeChanged', nextLocale)
    this.events.emit('localeChanged', nextLocale)
  }
}
