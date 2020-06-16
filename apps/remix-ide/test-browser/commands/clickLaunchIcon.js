const EventEmitter = require('events')

class ClickLaunchIcon extends EventEmitter {
  command (icon) {
    this.api.waitForElementVisible('#icon-panel div[plugin="' + icon + '"]').click('#icon-panel div[plugin="' + icon + '"]').perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = ClickLaunchIcon
