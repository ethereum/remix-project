import { ClientConnector } from "@remixproject/plugin"
import { Message } from '@remixproject/plugin-utils'

class ExtensionConnector implements ClientConnector {
  on(cb: (message: Partial<Message>) => void): void {
    throw new Error("Method not implemented.")
  }
  onMessage(message: Partial<Message>) {
    throw new Error('not implemented')
  }
  send() {
    throw new Error('not implemented')
  }
}