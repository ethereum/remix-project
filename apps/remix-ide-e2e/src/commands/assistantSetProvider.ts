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
    .waitForElementVisible('*[data-id="composer-textarea"]')
    .execute(function (provider) {
      (window as any).sendChatMessage(`/setAssistant ${provider}`);
    }, [provider])
    .waitForElementVisible({
      locateStrategy: 'xpath',
      selector: '//*[@data-id="remix-ai-assistant" and contains(.,"AI Provider set to")]'
    })
  done()
}

module.exports = SetAssistantProvider