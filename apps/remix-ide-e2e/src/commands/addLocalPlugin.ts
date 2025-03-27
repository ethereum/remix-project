import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'
import { ExternalProfile, LocationProfile, Profile } from '@remixproject/plugin-utils'

class AddLocalPlugin extends EventEmitter {
  command (this: NightwatchBrowser, profile: Profile & LocationProfile & ExternalProfile, focus: boolean): NightwatchBrowser {
    this.api.perform((done) => {
      addLocalPlugin(this.api, profile, focus, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addLocalPlugin (browser: NightwatchBrowser, profile: Profile & LocationProfile & ExternalProfile, focus: boolean, callback: VoidFunction) {
  browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
    .pause(3000).element('css selector', '*[data-id="pluginManagerComponentPluginManager"]', function (result) {
      if (result.status === 0) {
        browser.click('*[plugin="pluginManager"]')
      }
    })

  browser.waitForElementVisible('*[data-id="pluginManagerComponentPluginManager"]')
    .execute(function () {
      (window as any).testmode = true
    })
    .click('*[data-id="pluginManagerComponentPluginSearchButton"]')
    .waitForElementVisible('*[data-id="pluginManagerLocalPluginModalDialogModalDialogContainer-react"]')
    .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalBody-react"]')
    .waitForElementVisible('*[data-id="localPluginName"]')
    .clearValue('*[data-id="localPluginName"]').setValue('*[data-id="localPluginName"]', profile.name)
    .clearValue('*[data-id="localPluginDisplayName"]').setValue('*[data-id="localPluginDisplayName"]', profile.displayName)
    .clearValue('*[data-id="localPluginUrl"]').setValue('*[data-id="localPluginUrl"]', profile.url)
    .clearValue('*[data-id="localPluginCanActivate"]').setValue('*[data-id="localPluginCanActivate"]', profile.canActivate ? profile.canActivate.join(',') : '')
    .click('*[data-id="localPluginRadioButtoniframe"]')
    .click(profile.location === 'sidePanel' ? '*[data-id="localPluginRadioButtonsidePanel"]' : '*[data-id="localPluginRadioButtonmainPanel"]')
    .click('*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalFooter-react"]')
    .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react"]')
    .perform((done) => {
      if (focus) {
        browser.waitForElementVisible(`[data-id="verticalIconsKind${profile.name}"]`)
        .click(`[data-id="verticalIconsKind${profile.name}"]`)
      }
      done()
    })    
    .perform(function () { callback() })
}

module.exports = AddLocalPlugin
