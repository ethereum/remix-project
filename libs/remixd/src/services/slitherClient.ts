/* eslint dot-notation: "off" */

import * as WS from 'ws' // eslint-disable-line
import { PluginClient } from '@remixproject/plugin'
import { SlitherClientMixin } from '../lib/slither'

export class SlitherClient extends SlitherClientMixin(PluginClient) {
  websocket: WS

  setWebSocket(websocket: WS): void {
    this.websocket = websocket
  }

  sharedFolder(currentSharedFolder: string): void {
    this.currentSharedFolder = currentSharedFolder
  }
}


