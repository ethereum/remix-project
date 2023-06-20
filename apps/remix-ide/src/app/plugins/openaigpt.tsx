import { Plugin } from '@remixproject/engine'
import { OpenAIApi, CreateChatCompletionResponse } from 'openai'

const _paq = window._paq = window._paq || []

const profile = {
  name: 'openaigpt',
  displayName: 'openaigpt',
  description: 'openaigpt',
  methods: ['message'],
  events: [],
  maintainedBy: 'Remix',
}

export class OpenAIGpt extends Plugin {
  openai: OpenAIApi

  constructor() {
    super(profile)
  }

  async message(prompt): Promise<CreateChatCompletionResponse> {
    this.call('terminal', 'log', 'Waiting for GPT answer...')
    const result = await (await fetch('https://openai-gpt.remixproject.org', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({prompt})
    })).json()
    
    console.log(result)
    this.call('terminal', 'log', { type: 'typewritersuccess', value: result.choices[0].message.content })
    return result.data
  }
}