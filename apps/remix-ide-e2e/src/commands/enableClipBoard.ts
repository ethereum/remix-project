import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class EnableClipBoard extends EventEmitter {
  command (this: NightwatchBrowser, remember:boolean, accept: boolean): NightwatchBrowser {
    const browser = this.api
    if(browser.isChrome()){
      const chromeBrowser = (browser as any).chrome
      chromeBrowser.setPermission('clipboard-read', 'granted')
      chromeBrowser.setPermission('clipboard-write', 'granted')
    }
    if(browser.isFirefox()){
      const firefoxBrowser = (browser as any).firefox
      console.log('ff', firefoxBrowser)
      //firefoxBrowser.setPreference('devtools.inspector.clipboardSource.allowedOrigins', 'http://localhost:8080')
    }
    return this
  }
}

module.exports = EnableClipBoard
