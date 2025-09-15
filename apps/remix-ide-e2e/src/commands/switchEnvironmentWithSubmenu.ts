import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class switchEnvironmentWithSubmenu extends EventEmitter {
  command (this: NightwatchBrowser, provider: string, returnWhenInitialized?: boolean): NightwatchBrowser {
    const submenuLabels = ['Remix VM', 'Browser extension', 'Dev']

    const clickAndMaybeWait = (
      browser: NightwatchBrowser,
      cssSelector: string,
      providerName: string,
      shouldWait?: boolean
    ) => {
      browser
        .waitForElementVisible(cssSelector)
        .click(cssSelector)
        .perform((done) => {
          if (shouldWait) {
            browser
              .waitForElementVisible(`[data-id="selected-provider-${providerName}"]`)
              .perform(() => done())
          } else {
            done()
          }
        })
    }

    const waitForSelectedOrModal = (
      browser: NightwatchBrowser,
      providerName: string,
      timeoutMs = 4000,
      cb?: (ok: boolean) => void
    ) => {
      const start = Date.now()
      const poll = () => {
        browser.isPresent({ selector: `[data-id="selected-provider-${providerName}"]`, suppressNotFoundErrors: true, timeout: 0 }, (selRes) => {
          if (selRes.value) return cb ? cb(true) : undefined

          browser.isPresent({ selector: `*[data-id="${providerName}ModalDialogModalBody-react"]`, suppressNotFoundErrors: true, timeout: 0 }, (modalBody) => {
            if (modalBody.value) return cb ? cb(true) : undefined
            browser.isPresent({ selector: `*[data-id="${providerName}ModalDialogContainer-react"]`, suppressNotFoundErrors: true, timeout: 0 }, (modalContainer) => {
              if (modalContainer.value) return cb ? cb(true) : undefined

              if (Date.now() - start > timeoutMs) return cb ? cb(false) : undefined
              browser.pause(150).perform(poll)
            })
          })
        })
      }
      poll()
    }

    const tryHoverSubmenusAndClick = (
      browser: NightwatchBrowser,
      labels: string[],
      providerName: string,
      shouldWait: boolean,
      onDone: VoidFunction
    ) => {
      const tryOne = (i: number) => {
        if (i >= labels.length) return onDone()
        browser
          .useXpath()
          .isPresent({
            selector: `//span[contains(@class,'dropdown-item') and normalize-space()='${labels[i]}']`,
            suppressNotFoundErrors: true,
            timeout: 0
          }, (present) => {
            if (!present.value) {
              browser.useCss()
              return tryOne(i + 1)
            }

            browser
              .moveToElement(`//span[contains(@class,'dropdown-item') and normalize-space()='${labels[i]}']`, 5, 5)
              .pause(200)
              .useCss()
              .isPresent({
                selector: `body .dropdown-menu.show [data-id="dropdown-item-${providerName}"]`,
                suppressNotFoundErrors: true,
                timeout: 600
              }, (inPortal) => {
                if (inPortal.value) {
                  clickAndMaybeWait(browser, `body .dropdown-menu.show [data-id="dropdown-item-${providerName}"]`, providerName, shouldWait)
                  onDone()
                } else {
                  tryOne(i + 1)
                }
              })
          })
      }

      tryOne(0)
    }

    const attemptSelect = (
      browser: NightwatchBrowser,
      providerName: string,
      shouldWait?: boolean,
      onComplete?: VoidFunction
    ) => {
      browser
        .isPresent({ selector: `[data-id="dropdown-item-${providerName}"]`, suppressNotFoundErrors: true, timeout: 800 }, (topLevel) => {
          if (topLevel.value) {
            clickAndMaybeWait(browser, `[data-id="dropdown-item-${providerName}"]`, providerName, shouldWait)
            onComplete && browser.perform(() => onComplete())
          } else {
            tryHoverSubmenusAndClick(browser, submenuLabels, providerName, !!shouldWait, () => {
              onComplete && browser.perform(() => onComplete())
            })
          }
        })
    }

    this.api.useCss().waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
      .perform((done) => {
        this.api.isPresent({ selector: `[data-id="selected-provider-${provider}"]`, suppressNotFoundErrors: true, timeout: 1000 }, (result) => {
          if (result.value) return done()
          this.api.click('[data-id="settingsSelectEnvOptions"] button')

          attemptSelect(this.api, provider, returnWhenInitialized, () => {
            waitForSelectedOrModal(this.api, provider, 4000, (ok) => {
              if (ok) return done()
              this.api.isPresent({
                selector: `*[data-id="${provider}ModalDialogContainer-react"]`,
                suppressNotFoundErrors: true,
                timeout: 0
              }, (hasModal) => {
                const reopenDropdown = () => {
                  this.api.click('[data-id="settingsSelectEnvOptions"] button')
                }

                if (!hasModal.value) {
                  reopenDropdown()
                }

                this.api
                  .pinGrid(provider, true)
                  .click('[data-id="settingsSelectEnvOptions"] button')
                attemptSelect(this.api, provider, returnWhenInitialized, () => {
                  waitForSelectedOrModal(this.api, provider, 4000, () => done())
                })
              })
            })
          })
        })
      })
      .perform(() => this.emit('complete'))
    return this
  }
}

module.exports = switchEnvironmentWithSubmenu
