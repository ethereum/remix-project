const EventEmitter = require('events')

class ClickLaunchIcon extends EventEmitter {
  command (icon) {
    this.api.click('#icon-panel div[plugin="' + icon + '"]').perform(() => {
      this.emit('complete')
    })
    return this
  }
}

module.exports = ClickLaunchIcon
