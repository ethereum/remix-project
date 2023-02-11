import { ClientConnector, connectClient, applyApi, Client, PluginClient } from '@remixproject/plugin'
import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import { IRemixApi } from '@remixproject/plugin-api'


export interface WS {
  send(data: string): void
  on(type: 'message', cb: (event: string) => any): this
}

/**
 * This Websocket connector works with the library `ws`
 */
export class WebsocketConnector implements ClientConnector {

  constructor(private websocket: WS) {}

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    this.websocket.send(JSON.stringify(message))
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    this.websocket.on('message', (event) => {
      try {
        cb(JSON.parse(event)) 
      } catch (e) {
        console.error(e)
      }
    })
  }
}

/**
 * Connect a Websocket plugin client to a web engine
 * @param client An optional websocket plugin client to connect to the engine.
 *
 * ---------
 * @example
 * ```typescript
 * const wss = new WebSocket.Server({ port: 8080 });
 * wss.on('connection', (ws) => {
 *  const client = createClient(ws)
 * })
 * ```
 * ---------
 * @example
 * ```typescript
 * class MyPlugin extends PluginClient {
 *  methods = ['hello']
 *  hello() {
 *   console.log('Hello World')
 *  }
 * }
 * const wss = new WebSocket.Server({ port: 8080 });
 * wss.on('connection', (ws) => {
 *  const client = createClient(ws, new MyPlugin())
 * })
 * ```
 */
export const createClient = <
  P extends Api,
  App extends ApiMap = Readonly<IRemixApi>
>(websocket: WS, client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  connectClient(new WebsocketConnector(websocket), c)
  applyApi(c)
  return c
}
