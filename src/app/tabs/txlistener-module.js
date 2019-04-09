import { BaseApi } from 'remix-plugin'
import { EventEmitter } from 'events'

const profile = {
  name: 'txListener',
  displayName: 'transaction listener',
  events: ['newTransaction'],
  description: 'service - notify new transactions',
  permission: true
}

export class TxListenerModule extends BaseApi {

  constructor (txlistener) {
    super(profile)
    this.events = new EventEmitter()
    txlistener.event.register('newTransaction', (tx) => {
      this.events.emit('newTransaction', tx)
    })
  }
}
