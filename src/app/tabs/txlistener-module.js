import { ApiFactory } from 'remix-plugin'
import { EventEmitter } from 'events'

export class TxListenerModule extends ApiFactory {

  constructor (txlistener) {
    super()
    this.events = new EventEmitter()
    txlistener.event.register('newTransaction', (tx) => {
      this.events.emit('newTransaction', tx)
    })
  }

  get profile () {
    return {
      name: 'txListener',
      displayName: 'transaction listener',
      events: ['newTransaction'],
      description: 'service - notify new transactions',
      permission: true
    }
  }
}
