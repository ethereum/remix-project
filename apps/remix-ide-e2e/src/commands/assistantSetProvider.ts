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
    .waitForElementPresent('*[data-id="remix-ai-assistant-ready"]')
    .execute(function (provider) {
      (window as any).remixAIChat.current.sendChat(`/setAssistant ${provider}`);
    }, [provider])
    .waitForElementVisible({
      locateStrategy: 'xpath',
      selector: `//*[contains(@class,'chat-bubble') and contains(.,'AI Provider set to')]`,
      timeout: 50000,
      abortOnFailure: true
    })
    .waitForElementPresent({
      locateStrategy: 'xpath',
      selector: "//*[@data-id='remix-ai-streaming' and @data-streaming='false']",
    })
    //.pause()
    .perform(() => done())
}

module.exports = SetAssistantProvider
