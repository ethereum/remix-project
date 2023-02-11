import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import {
  ClientConnector,
  connectClient,
  applyApi,
  Client,
  PluginClient,
  isHandshake,
  PluginOptions,
  isPluginMessage,
  checkOrigin,
} from '@remixproject/plugin'

declare const acquireVsCodeApi: any
/**
 * This Webview connector
 */
export class WebviewConnector implements ClientConnector {
  source: { postMessage: (message: any, origin?: string) => void }
  origin: string
  isVscode: boolean

  constructor(private options: Partial<PluginOptions<any>> = {}) {
    this.isVscode = !!acquireVsCodeApi
    this.source = this.isVscode ? acquireVsCodeApi() : window.parent
  }


  /** Send a message to the engine */
  send(message: Partial<Message>) {
    if (this.isVscode) {
      this.source.postMessage(message)
    } else if (this.origin || isHandshake(message)) {
      const origin = this.origin || '*'
      this.source.postMessage(message, origin)
    }
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    window.addEventListener('message', async (event: MessageEvent) => {
      if (!event.source) return
      if (!event.data) return
      if (!isPluginMessage(event.data)) return
      // Support for iframe
      if (!this.isVscode) {
        const isGoodOrigin = await checkOrigin(event.origin, this.options)
        if (!isGoodOrigin) return console.warn('Origin provided is not allow in message', event)
        if (isHandshake(event.data)) {
          this.origin = event.origin
          this.source = event.source as Window
        }
      }
      cb(event.data)

    }, false)
  }
}

/**
 * Connect a Webview plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 */
export const createClient = <
  P extends Api,
  App extends ApiMap
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  const options = client.options
  const connector = new WebviewConnector(options)
  connectClient(connector, c)
  applyApi(c)
  return client as any
}