import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ConnectToExternalHttpProvider extends EventEmitter {
    command(this: NightwatchBrowser, url: string): NightwatchBrowser {
        console.log('ConnectToExternalHttpProvider: ' + url)
        this.api.element('xpath', "//*[@class='udapp_environment' and contains(.,'Main')]",
            (result) => {
                console.log('ConnectToExternalHttpProvider: ' + result.status, result.value)
                if (result.status as any === -1 ) {
                    console.log("No connection")
                    browser
                        .click({
                            locateStrategy: 'css selector',
                            selector: '[data-id="basic-http-provider-modal-footer-ok-react"]',
                            abortOnFailure: true,
                            suppressNotFoundErrors: true,
                            timeout: 5000
                        })
                        .switchEnvironment('External Http Provider')
                        .waitForElementPresent('[data-id="basic-http-provider-modal-footer-ok-react"]')
                        .execute(() => {
                            (document.querySelector('*[data-id="basic-http-providerModalDialogContainer-react"] input[data-id="modalDialogCustomPromp"]') as any).focus()
                        }, [], () => { })
                        .setValue('[data-id="modalDialogCustomPromp"]', url)
                        .modalFooterOKClick('basic-http-provider')
                        .perform((done) => {
                            done()
                            this.emit('complete')
                        })
                } else {
                    this.api.perform((done) => {
                        done()
                        this.emit('complete')
                    })
                }
            }
        )
        return this
    }
}

module.exports = ConnectToExternalHttpProvider
