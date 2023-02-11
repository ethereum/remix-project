import type { Message, Api, ApiMap } from '@remixproject/plugin-utils';
import { IRemixApi } from '@remixproject/plugin-api';
import {
  ClientConnector,
  connectClient,
  applyApi,
  Client,
  PluginClient,
  isHandshake,
  isPluginMessage,
  PluginOptions,
  checkOrigin
} from '@remixproject/plugin'

import { listenOnThemeChanged } from './theme'


export class IframeConnector implements ClientConnector {
  source: Window
  origin: string

  constructor(private options: PluginOptions<any>) {}

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    if (this.source) {
      this.source.postMessage(message, this.origin)
    } else if (isHandshake(message)) {
      window.parent.postMessage(message, '*')
    }
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    window.addEventListener('message', async (event: MessageEvent) => {
      if (!event.source) return
      if (!event.data) return
      if (!isPluginMessage(event.data)) return
      // Check that the origin is the right one
      const isGoodOrigin = await checkOrigin(event.origin, this.options)
      if (!isGoodOrigin) return console.warn('Origin provided is not allow in message', event)
      if (isHandshake(event.data)) {
        this.source = event.source as Window
        this.origin = event.origin
      }
      cb(event.data)

    }, false)
  }
}

/**
 * Connect an Iframe client to a web engine
 * @param client An optional iframe client to connect to the engine
 * @example Let the function create a client
 * ```typescript
 * const client = createClient()
 * ```
 * @example With a custom client
 * ```typescript
 * class MyPlugin extends PluginClient {
 *  methods = ['hello']
 *  hello() {
 *   console.log('Hello World')
 *  }
 * }
 * const client = createClient(new MyPlugin())
 * ```
 */

export const createClient = <
  P extends Api,
  App extends ApiMap = Readonly<IRemixApi>
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  const options = client.options
  const connector = new IframeConnector(options)
  connectClient(connector, c)
  applyApi(c)
  if (!options.customTheme) {
    listenOnThemeChanged(c)
  }
  return c as Client<P, App>
}
