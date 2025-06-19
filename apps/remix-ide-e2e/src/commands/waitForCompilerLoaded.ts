import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

const selector = '.udapp_contractNames'

class WaitForCompilerLoaded extends EventEmitter {
    command(this: NightwatchBrowser, contractName: string): NightwatchBrowser {
        this.api
            .waitForElementPresent({
                selector: "//*[@data-id='compilerloaded']",
                locateStrategy: 'xpath',
                timeout: 120000
            })
            .perform(() => this.emit('complete'))
        return this
    }
}

module.exports = WaitForCompilerLoaded
