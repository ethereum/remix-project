import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class AssistantGenerate extends EventEmitter {
  command(this: NightwatchBrowser, prompt: string, provider: string): NightwatchBrowser {
    this.api.perform((done) => {
      generate(this.api, prompt, provider, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function generate(browser: NightwatchBrowser, prompt: string, provider: string, done: VoidFunction) {
  browser
    .click('*[data-id="composer-textarea"]')
    .waitForElementVisible('*[data-id="composer-textarea"]')
    .execute(function (prompt) {
      (window as any).sendChatMessage(`/generate ${prompt}`);
    }, [prompt])
    .waitForElementVisible({
      locateStrategy: 'xpath',
      selector: `//*[@data-id="remix-ai-assistant" and contains(.,"/generate ${prompt}")]`
    })
  done()
}

module.exports = AssistantGenerate;