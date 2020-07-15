const EventEmitter = require('events')

class AddFile extends EventEmitter {
  command (name, content) {
    this.api.perform((done) => {
      addFile(this.api, name, content, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addFile (browser, name, content, done) {
  browser.clickLaunchIcon('udapp').clickLaunchIcon('fileExplorers').click('.newFile')
      .waitForElementVisible('#modal-dialog')
      .perform((client, done) => {
        browser.execute(function (fileName) {
          if (fileName !== 'Untitled.sol') {
            document.querySelector('#modal-dialog #prompt_text').setAttribute('value', fileName)
          }
          document.querySelector('#modal-footer-ok').click()
        }, [name], function (result) {
          console.log(result)
          done()
        })
      })
      .setEditorValue(content.content)
      .pause(1000)
      .perform(function () {
        done()
      })
}

module.exports = AddFile
