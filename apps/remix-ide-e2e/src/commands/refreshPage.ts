import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class RefreshPage extends EventEmitter {
    command(this: NightwatchBrowser) {
        browser.refresh()
        .verifyLoad()
        .perform((done) => {
            done()
            this.emit('complete')
        })
    }
}


module.exports = RefreshPage