import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class AssistantWorkspace extends EventEmitter {
  command(this: NightwatchBrowser, prompt: string, provider: string): NightwatchBrowser {
    this.api.perform((done) => {
      workspaceGenerate(this.api, prompt, provider, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function workspaceGenerate(browser: NightwatchBrowser, prompt: string, provider: string, done: VoidFunction) {
  browser
    .waitForElementVisible('*[data-id="remix-ai-assistant"]')
    .waitForElementVisible('*[data-id="remix-ai-assistant-ready"]')
    .assistantSetProvider(provider)
    .pause(5000)
    .execute(function (prompt) {
      (window as any).sendChatMessage(`/workspace ${prompt}`);
    }, [prompt])
  done()
}

module.exports = AssistantWorkspace;