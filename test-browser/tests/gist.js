'use strict'
const init = require('../helpers/init')
const sauce = require('./sauce')
// 99266d6da54cc12f37f11586e8171546c7700d67

module.exports = {
  before: function (browser, done) {
    init(browser, done)
  },
  'UploadToGists': function (browser) {
      /*
       - set the access token
       - publish to gist
       - retrieve the gist
       - switch to a file in the new gist
      */
    console.log('token', process.env.gist_token)
    browser
    .waitForElementVisible('#icon-panel', 10000)
    .clickLaunchIcon('fileExplorers')
    .click('#publishToGist')
    .modalFooterOKClick()
    .getModalBody((value, done) => {
      const reg = /gist.github.com\/([^.]+)/
      const id = value.match(reg)
      console.log('gist regex', id)
      if (!id) {
        browser.assert.fail('cannot get the gist id', '', '')
      } else {
        let gistid = id[1]
        browser
          .modalFooterCancelClick()
          .executeScript(`remix.loadgist('${gistid}')`)
          .switchFile('browser/gists')
          .switchFile(`browser/gists/${gistid}`)
          .switchFile(`browser/gists/${gistid}/1_Storage.sol`)
          .perform(done)
      }
    })
    .end()
  },
  tearDown: sauce
}
