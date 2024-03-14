import { NightwatchBrowser } from 'nightwatch'

const gist_id  = 'a4af87f9ae096a01c7819e75b32d1b72'
module.exports = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        done()
    },
    'start gist': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 10000)
        .waitForElementVisible('*[data-id="landingPageImportFromGist"]')
        .click('*[data-id="landingPageImportFromGist"]')
        .waitForElementVisible('*[data-id="gisthandlerModalDialogModalBody-react"] input[data-id="modalDialogCustomPromp"]')
        .execute(function () {
          (document.querySelector('*[data-id="gisthandlerModalDialogModalBody-react"] input[data-id="modalDialogCustomPromp"]') as any).focus()
        })
        .setValue('*[data-id="gisthandlerModalDialogModalBody-react"] input[data-id="modalDialogCustomPromp"]', gist_id)
        .modalFooterOKClick('gisthandler')
        //.pause()
    }
}