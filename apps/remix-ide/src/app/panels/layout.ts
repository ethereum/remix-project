import { Plugin } from '@remixproject/engine'
import { Profile } from '@remixproject/plugin-utils'
const EventManager = require('../../lib/events')

const profile:Profile = {
  name: 'layout',
  description: 'layout'
}
export class Layout extends Plugin {
  event: any
  constructor () {
    super(profile)
    this.event = new EventManager()
  }
}
