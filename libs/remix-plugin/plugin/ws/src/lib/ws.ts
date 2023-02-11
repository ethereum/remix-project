import {
  Message,
  Api,
  ApiMap,
  getMethodPath,
} from '@remixproject/plugin-utils'
import {
  PluginClient,
  ClientConnector,
  connectClient,
  applyApi,
  Client,
  isHandshake,
} from '@remixproject/plugin'
import { IRemixApi } from '@remixproject/plugin-api'

export interface WS {
  send(data: string): void
  on(type: 'message', cb: (event: string) => any): this
}

/**
 * This Websocket connector works with the library `ws`
 */
export class WebsocketConnector implements ClientConnector {
  private client: PluginClient
  constructor(private websocket: WS) {}

  setClient(client: PluginClient) {
    this.client = client
  }

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    this.websocket.send(JSON.stringify(message))
  }

  /** Get message from the engine */
  on(cb: (message: Partial<Message>) => void) {
    this.websocket.on('message', (event) => {
      try {
        const parsedEvent = JSON.parse(event)
        if (!isHandshake(parsedEvent)) {
          if (
            parsedEvent.action &&
            (parsedEvent.action === 'request' || parsedEvent.action === 'call')
          ) {
            const path =
              parsedEvent.requestInfo && parsedEvent.requestInfo.path
            const method = getMethodPath(parsedEvent.key, path)
            if (this.client.methods && !this.client.methods.includes(method)) {
              throw new Error(
                `${method} is not in the list of allowed methods.`
              )
            }
          }
        }
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
>(
  websocket: WS,
  client: PluginClient<P, App> = new PluginClient()
): Client<P, App> => {
  const c = client as any
  const websocketConnector:WebsocketConnector = new WebsocketConnector(websocket)
  connectClient(websocketConnector, c)
  applyApi(c)
  websocketConnector.setClient(c)
  return c
}
