import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class GetModalBody extends EventEmitter {
  command (this: NightwatchBrowser, callback: (value: string, cb: VoidFunction) => void) {
    run(this.api, callback)
    return this
  }
}

async function run (api: NightwatchBrowser, callback: (value: string, cb: VoidFunction) => void) {
  await api.waitForElementVisible('[data-id="modalDialogModalBody"]')
  const result: any = await api.getText('#modal-dialog')
  console.log(result)
  const value = typeof result.value === 'string' ? result.value : null

  callback(value, () => {
    this.emit('complete')
  })
  return this
}

module.exports = GetModalBody
