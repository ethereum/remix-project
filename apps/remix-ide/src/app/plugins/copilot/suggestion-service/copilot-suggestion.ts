import {Plugin} from '@remixproject/engine'
import {SuggestionService, SuggestOptions} from './suggestion-service'
import axios, {AxiosResponse} from 'axios'
//@ts-ignore
const _paq = (window._paq = window._paq || []) //eslint-disable-line

const profile = {
  name: 'copilot-suggestion',
  displayName: 'copilot-suggestion',
  description: 'Get Solidity suggestions in editor',
  methods: ['suggest', 'init', 'uninstall', 'status', 'isActivate', 'discardRemoteService', 'useconfig'],
  version: '0.1.0-alpha',
  maintainedBy: "Remix"
}

export class CopilotSuggestion extends Plugin {
  service: SuggestionService
  context: string
  ready: boolean
  config: { [id: string]: string }
  constructor() {
    super(profile)
    this.service = new SuggestionService()
    this.context = ''
    this.ready = true // always ready for service
    this.config = {}
  }


  useconfig(config ){
    this.config = config
  }

  discardRemoteService() {
    this.ready = false
  }

  status () {
    return this.ready
  }

  async isActivate () {
    try {
      return await this.call('settings', 'get', 'settings/copilot/suggest/activate')
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async suggest(content: string) {
    if (!await this.call('settings', 'get', 'settings/copilot/suggest/activate')) return { output: [{ generated_text: ''}]}

    const max_new_tokens = await this.call('settings', 'get', 'settings/copilot/suggest/max_new_tokens')
    const temperature = await this.call('settings', 'get', 'settings/copilot/suggest/temperature')
    const options: SuggestOptions = {
      top_k: 50,
      top_p: 0.92,
      stream_result: false,
      temperature: temperature || 0.9,
      max_new_tokens: max_new_tokens || 0
    }

    if (this.ready){
      const data = await this.call('solcoder', 'code_completion', content.split(" ").slice(-1000).join(" "), options)
      const parsedData = data[0].trimStart()
      return {output: [{generated_text: parsedData}]}
    }else{
      return
    }
  }

  async loadModeContent() {
    let importsContent = ''
    const imports = await this.call('codeParser', 'getImports')
    for (const imp of imports.modules) {
      try {
        importsContent += '\n\n' + (await this.call('contentImport', 'resolve', imp)).content
      } catch (e) {
        console.log(e)
      }
    }
    return importsContent
  }

  async init() {
    return this.service.init()
  }

  async uninstall() {
    this.service.terminate()
  }
}
