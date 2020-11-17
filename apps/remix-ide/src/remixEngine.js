/* global localStorage, fetch */
import { Engine } from '@remixproject/engine'
import { EventEmitter } from 'events'

export class RemixEngine extends Engine {

  constructor () {
    super()
    this.event = new EventEmitter()
  }

  setPluginOption ({ name, kind }) {
    if (kind === 'provider') return {queueTimeout: 60000 * 2}
    if (name === 'LearnEth') return {queueTimeout: 60000}
    return {queueTimeout: 10000}
  }

  onRegistration (plugin) {
    this.event.emit('onRegistration', plugin)
  }
}
