import { Plugin } from '@remixproject/engine'
import { Profile, PluginOptions } from '@remixproject/plugin-utils'
import { window, QuickPickOptions, InputBoxOptions } from 'vscode'

export const windowProfile: Profile = {
  name: 'window',
  methods: ['prompt', 'select', 'selectFile', 'selectFolder', 'alert', 'error', 'warning'],
}

interface IWindowPlugin {
  /** Display an input window */
  prompt(): Thenable<string>
  /** Display a select window */
  select(options: string[]): Thenable<string>
  /** Display a select window with local file system: can only select a file */
  selectFile(): Thenable<string>
  /** Display a select window with local file system: can only select a folder */
  selectFolder(): Thenable<string>
  /** Display a message with actions button. Returned the button clicked if any */
  alert(message: string, actions?: string[]): Thenable<string>
  /** Display a warning message with actions button. Returned the button clicked if any */
  warning(message: string, actions?: string[]): Thenable<string>
  /** Display an error message with actions button. Returned the button clicked if any */
  error(message: string, actions?: string[]): Thenable<string>
}

export class WindowPlugin extends Plugin implements IWindowPlugin {

  constructor(options: PluginOptions = {}) {
    super(windowProfile)
    // Leave 1min to let the user interact with the window
    super.setOptions({ queueTimeout: 60_000, ...options })
  }

  prompt(options?: InputBoxOptions) {
    return window.showInputBox(options)
  }

  select(items: string[], options?: QuickPickOptions) {
    return window.showQuickPick(items, options)
  }

  selectFile() {
    return window.showOpenDialog({ canSelectFiles: true }).then(([file]) => file.fsPath)
  }

  selectFolder() {
    return window.showOpenDialog({ canSelectFolders: true }).then(([folder]) => folder.fsPath)
  }

  alert(message: string, actions: string[] = []) {
    return window.showInformationMessage(message, ...actions)
  }

  error(message: string, actions: string[] = []) {
    return window.showErrorMessage(message, ...actions)
  }

  warning(message: string, actions: string[] = []) {
    return window.showWarningMessage(message, ...actions)
  }

}