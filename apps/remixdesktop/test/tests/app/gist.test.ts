import { NightwatchBrowser } from 'nightwatch'

const gist_id  = '02a847917a6a7ecaf4a7e0d4e68715bf'
const tests = {
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        done()
    },
    'start gist': function (browser: NightwatchBrowser) {
      browser.end()
      /*
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
        .pause(3000)
        .windowHandles(function (result) {
          console.log(result.value)
          browser.switchWindow(result.value[1])
          .waitForElementVisible('*[data-id="treeViewDivtreeViewItemREADME.txt"]')
        })
        .click('[data-id="treeViewLitreeViewItemcontracts"]')
        .openFile('contracts/3_Ballot.sol')
        .end()
        */
    }
}

module.exports = {
  ...tests
}