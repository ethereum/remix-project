'use strict'
import { RemixdClient as sharedFolder } from './services/remixdClient'
import { GitClient } from './services/gitClient'
import { HardhatClient } from './services/hardhatClient'
import { TruffleClient } from './services/truffleClient'
import { SlitherClient, SlitherClientMixin } from './services/slitherClient'
import Websocket from './websocket'
import * as utils from './utils'

module.exports = {
  Websocket,
  utils,
  SlitherClientMixin, // For the JS client
  services: {
    sharedFolder,
    GitClient,
    HardhatClient,
    TruffleClient,
    SlitherClient
  }
}

export { SlitherClientMixin } // for TS
