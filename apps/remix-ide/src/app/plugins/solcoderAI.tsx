import { Plugin } from '@remixproject/engine'
import {SuggestOptions} from './copilot/suggestion-service/suggestion-service'

const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'solcoder',
  displayName: 'solcoder',
  description: 'solcoder',
  methods: ['code_generation', 'code_completion', "solidity_answer", "code_explaining"],
  events: [],
  maintainedBy: 'Remix',
}

export class SolCoder extends Plugin {
  api_url: string
  constructor() {
    super(profile)
    this.api_url = "https://solcoder.remixproject.org"
  }

  async code_generation(prompt): Promise<any> {
    this.emit("aiInfering")
    this.call('layout', 'maximizeTerminal')
    this.call('terminal', 'log', 'Waiting for Solcoder answer...')
    let result
    try {
      result = await(
        await fetch(this.api_url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"data":[prompt, "code_generation", false,1000,0.2,0.8,50]}),
        })
      ).json()
      return result.data[0]
    } catch (e) {
      this.call('terminal', 'log', { type: 'typewritererror', value: `Unable to get a response ${e.message}` })
      return
    }finally {
      this.emit("aiInferingDone")
    }
  }

  async solidity_answer(prompt): Promise<any> {
    this.emit("aiInfering")
    this.call('layout', 'maximizeTerminal')
    this.call('terminal', 'log', 'Waiting for Solcoder answer...')
    let result
    try {
      result = await(
        await fetch(this.api_url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"data":[prompt, "solidity_answer", false,1000,0.9,0.8,50]}),
        })
      ).json()
    } catch (e) {
      this.call('terminal', 'log', { type: 'typewritererror', value: `Unable to get a response ${e.message}` })
      return
    }finally {
      this.emit("aiInferingDone")
    }
    if (result) {
      this.call('terminal', 'log', { type: 'typewriterwarning', value: result.data[0]})
    } else if  (result.error) {
      this.call('terminal', 'log', { type: 'typewriterwarning', value: "Error on request" })
    }

  }

  async code_explaining(prompt): Promise<any> {
    this.emit("aiInfering")
    this.call('layout', 'maximizeTerminal')
    this.call('terminal', 'log', 'Waiting for Solcoder answer...')
    let result
    try {
      result = await(
        await fetch(this.api_url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"data":[prompt, "code_explaining", false,2000,0.9,0.8,50]}),
        })
      ).json()
      if (result) {
        this.call('terminal', 'log', { type: 'typewriterwarning', value: result.data[0]})
      }
      return result.data[0]
    } catch (e) {
      this.call('terminal', 'log', { type: 'typewritererror', value: `Unable to get a response ${e.message}` })
      return
    }finally {
      this.emit("aiInferingDone")
    }
  }

  async code_completion(prompt, options:SuggestOptions=null): Promise<any> {
    this.emit("aiInfering")
    let result
    try {
      result = await(
        await fetch(this.api_url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({"data": !options? [
            prompt, // string  in 'context_code' Textbox component	
            "code_completion",
            "", // string  in 'comment' Textbox component		
            false, // boolean  in 'stream_result' Checkbox component		
            200, // number (numeric value between 0 and 2000) in 'max_new_tokens' Slider component		
            0.9, // number (numeric value between 0.01 and 1) in 'temperature' Slider component		
            0.90, // number (numeric value between 0 and 1) in 'top_p' Slider component		
            50, // number (numeric value between 1 and 200) in 'top_k' Slider component
          ] : [
            prompt,
            "code_completion",
            "",
            options.stream_result,
            options.max_new_tokens,
            options.temperature,
            options.top_p,
            options.top_k
          ]}),
        })
      ).json()

      return result.data
    } catch (e) {
      this.call('terminal', 'log', { type: 'typewritererror', value: `Unable to get a response ${e.message}` })
      return
    } finally {
      this.emit("aiInferingDone")
    }
  }

}
