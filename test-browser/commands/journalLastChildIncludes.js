const EventEmitter = require('events')

/*
  Check if the last log in the console contains a specific text
*/
class JournalLastChildIncludes extends EventEmitter {
  command (val) {
    this.api
    .waitForElementVisible('*[data-id="terminalJournal"] > div:last-child', 10000)
    .getText('*[data-id="terminalJournal"] > div:last-child', (result) => {
      console.log('JournalLastChildIncludes', result.value)
      if (result.value.indexOf(val) === -1) return this.api.assert.fail(`wait for ${val} in ${result.value}`)
      else this.api.assert.ok(`<*[data-id="terminalJournal"] > div:last-child> contains ${val}.`)
      this.emit('complete')
    })
    return this
  }
}

module.exports = JournalLastChildIncludes
