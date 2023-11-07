import {Plugin} from '@remixproject/engine'
import {SuggestionService, SuggestOptions} from './suggestion-service'
const _paq = (window._paq = window._paq || []) //eslint-disable-line

const profile = {
  name: 'copilot-suggestion',
  displayName: 'copilot-suggestion',
  description: 'copilot-suggestion',
  methods: ['suggest']
}

export class CopilotSuggestion extends Plugin {
  service: SuggestionService
  constructor() {
    super(profile)
    this.service = new SuggestionService()
    this.service.events.on('progress', (data) => {
      this.call('terminal', 'log', {type: 'info', value: `loading Solidity copilot: ${(data.loaded / data.total) * 100}% done.` })
    })
    this.service.events.on('done', (data) => {
      this.call('terminal', 'log', { type: 'info', value: `Solidity copilot loaded.`})
    })
    this.service.events.on('ready', (data) => {
      this.call('terminal', 'log', { type: 'info', value: `Solidity copilot ready to use.`})
    })
  }

  async suggest(content: string) {
    const options: SuggestOptions = {
      do_sample: false,
      top_k: 0,
      temperature: await this.call('settings', 'get', 'settings/copilot/suggest/temperature'),
      max_new_tokens: await this.call('settings', 'get', 'settings/copilot/suggest/max_new_tokens')
    }
    return this.service.suggest(content, options)
  }

  async init() {
   return this.service.init()
  }

  async uninstall() {
   }
}