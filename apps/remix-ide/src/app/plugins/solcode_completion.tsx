import { Plugin } from '@remixproject/engine'
import { client } from "@gradio/client"

const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'solcoder_completion',
  displayName: 'solcoder_completion',
  description: 'solcoder_completion',
  methods: ['message'],
  events: [],
  maintainedBy: 'Remix',
}

export class SolCodeComp extends Plugin {
  constructor() {
    super(profile)
  }

  async message(prompt): Promise<any> {
    this.call('layout', 'maximizeTerminal')
    this.call('terminal', 'log', 'Waiting for GPT answer...')
    let result
    try {
      const app = await client("http://127.0.0.1:7860/", null);
      const result = await app.predict("/code_completion", [		
              prompt, // string  in 'context_code' Textbox component		
              "", // string  in 'comment' Textbox component		
              false, // boolean  in 'stream_result' Checkbox component		
              200, // number (numeric value between 0 and 2000) in 'max_new_tokens' Slider component		
              0.4, // number (numeric value between 0.01 and 1) in 'temperature' Slider component		
              0.90, // number (numeric value between 0 and 1) in 'top_p' Slider component		
              50, // number (numeric value between 1 and 200) in 'top_k' Slider component
        ]);
        return result
    } catch (e) {
      this.call('terminal', 'log', { type: 'typewritererror', value: `Unable to get a response ${e.message}` })
      return
    }
  }
}
