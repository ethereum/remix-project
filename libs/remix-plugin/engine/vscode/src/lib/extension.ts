// Check here : https://code.visualstudio.com/api/references/vscode-api#extensions
import { PluginConnector } from "@remixproject/engine"
import { Profile, ExternalProfile, Message } from '@remixproject/plugin-utils'
import { extensions, Extension } from 'vscode'

export class ExtensionPlugin extends PluginConnector {
  private extension: Extension<any>
  private connector: any

  constructor(profile: Profile & ExternalProfile) {
    super(profile)
  }

  protected send(message: Partial<Message>): void {
    if (this.extension) {
      this.connector.onMessage(message)
    }
  }

  protected async connect(url: string): Promise<void> {
    try {
      this.extension = extensions.getExtension(url)
      this.connector = await this.extension.activate()
    } catch (err) {
      throw new Error(`ExtensionPlugin "${this.profile.name}" could not connect to the engine.`)
    }
  }

  protected disconnect(): void {
    if (this.extension) {}
  }
}
