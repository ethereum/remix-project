import type { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils'
import { PluginConnector } from '@remixproject/engine'
import { fork, ChildProcess } from 'child_process'

export class ChildProcessPlugin extends PluginConnector {
  private readonly listener = ['message', (msg: Message) => this.getMessage(msg)] as const
  process: ChildProcess

  constructor(profile: Profile & ExternalProfile) {
    super(profile)
  }

  protected send(message: Partial<Message>): void {
    if (!this.process?.connected) {
      throw new Error(`Child process from plugin "${this.name}" is not yet connected`)
    }
    this.process.send(message)
  }

  protected connect(url: string): void {
    this.process = fork(url)
    this.process.on(...this.listener)
  }

  protected disconnect(): void {
    this.process.off(...this.listener)
    this.process.disconnect()
    this.process.kill()
  }

}
