'use strict'
import { RemixdClient as sharedFolder } from './services/remixdClient'
import Websocket from './websocket'
import * as utils from './utils'

module.exports = {
  Websocket,
  utils,
  services: {
    sharedFolder
  }
}
