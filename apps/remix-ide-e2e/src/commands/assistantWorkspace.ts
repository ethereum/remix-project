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
    .waitForElementVisible('*[data-id="composer-textarea"]')
    .execute(function (prompt) {
      (window as any).sendChatMessage(`/workspace ${prompt}`);
    }, [provider, prompt])
  done()
}

module.exports = AssistantWorkspace;