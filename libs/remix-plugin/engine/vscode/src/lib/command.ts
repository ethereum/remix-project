import { Plugin } from '@remixproject/engine'
import { Profile, PluginOptions } from '@remixproject/plugin-utils'
import { Disposable, commands } from 'vscode'

export const transformCmd = (name: string, method: string) =>
  `remix.${name}.${method}`

export interface CommandOptions extends PluginOptions {
  transformCmd: (name: string, method: string) => string
}

// WIP
/**
 * Connect methods of the plugins with a command depending on the transformCmd function pass as option
 */
export class CommandPlugin extends Plugin {
  subscriptions: Disposable[] = []
  options: CommandOptions

  constructor(profile: Profile) {
    super(profile)
    this.setOptions({
      transformCmd,
    })
  }

  setOptions(options: Partial<CommandOptions>) {
    return super.setOptions(options)
  }

  activate() {
    this.subscriptions = this.profile.methods
      .map((method) => {
        try {
          const cmd = this.options.transformCmd(this.profile.name, method)
          return commands.registerCommand(cmd, (...args) =>
            this.callPluginMethod(method, args)
          )
        } catch (err) {
          console.log(err)
        }
      })
      .filter((command) => {
        return command
      })
    super.activate()
  }

  deactivate() {
    super.deactivate()
    this.subscriptions.forEach((sub) => sub.dispose())
  }
}