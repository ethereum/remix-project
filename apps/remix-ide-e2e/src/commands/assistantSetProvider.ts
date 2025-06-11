import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class SetAssistantProvider extends EventEmitter {
  command(this: NightwatchBrowser, provider: string): NightwatchBrowser {
    this.api.perform((done) => {
      setAssistant( this.api, provider, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function setAssistant(browser: NightwatchBrowser, provider: string, done: VoidFunction) {
  browser
    .waitForElementVisible('*[data-id="remix-ai-assistant-ready"]')
    //.waitForElementVisible('*[data-id="composer-ai-add-context"]')
    .waitForElementVisible('*[data-id="composer-ai-workspace-generate"]')
    .pause(3000)
    .execute(function (provider) {
      (window as any).sendChatMessage(`/setAssistant ${provider}`);
    }, [provider])
    .waitForElementVisible({
      locateStrategy: 'xpath',
      selector: '//*[@data-id="remix-ai-assistant" and contains(.,"AI Provider set to")]',
      timeout: 50000,
      abortOnFailure: true
    })
    //.pause()
    .perform(() => done())  
}

module.exports = SetAssistantProvider
