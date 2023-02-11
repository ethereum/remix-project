import { Plugin } from '@remixproject/engine'
import { IWindow, windowProfile } from '@remixproject/plugin-api'
import { MethodApi, PluginOptions } from '@remixproject/plugin-utils';

export class WindowPlugin extends Plugin implements MethodApi<IWindow> {

  constructor(options: PluginOptions = {}) {
    super(windowProfile)
    // Leave 1min to let the user interact with the window
    super.setOptions({ queueTimeout: 60_000, ...options })
  }

  /** Display an input window */
  prompt(message?: string): Promise<string> {
    return new Promise((res, rej) => res(window.prompt(message)));
  }

  /** Ask confirmation for an action */
  confirm(message: string): Promise<boolean> {
    return new Promise((res) => res(window.confirm(message)));
  }

  /** Display a message with actions button. Returned the button clicked if any */
  alert(message: string, actions?: string[]): Promise<void> {
    return new Promise((res, rej) => res(window.alert(message)));
  }

}