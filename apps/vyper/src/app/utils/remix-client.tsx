import {HighlightPosition, CompilationResult, RemixApi} from '@remixproject/plugin-api'
import {Api, Status} from '@remixproject/plugin-utils'
import {createClient} from '@remixproject/plugin-webview'
import {PluginClient} from '@remixproject/plugin'
import {Contract} from './compiler'
import {ExampleContract} from '../components/VyperResult'
import { ThemeKeys } from 'react-json-view'

export class RemixClient extends PluginClient {
  private client = createClient<Api, Readonly<RemixApi>>(this)

  loaded() {
    return this.client.onload()
  }

  /** Emit an event when file changed */
  async onFileChange(cb: (contract: string) => any) {
    this.client.on('fileManager', 'currentFileChanged', async (name: string) => {
      cb(name)
    })
  }

  /** Emit an event when file changed */
  async onNoFileSelected(cb: () => any) {
    this.client.on('fileManager', 'noFileSelected', async () => {
      cb()
    })
  }

  /** Load Ballot contract example into the file manager */
  async loadContract({name, address}: ExampleContract) {
    try {
      const content = await this.client.call('contentImport', 'resolve', address)
      await this.client.call('fileManager', 'setFile', content.cleanUrl, content.content)
      await this.client.call('fileManager', 'switchFile', content.cleanUrl)
    } catch (err) {
      console.log(err)
    }
  }

  async cloneVyperRepo() {
    try {
      // @ts-ignore
      this.call('notification', 'toast', 'cloning Vyper repository...')
      await this.call('manager', 'activatePlugin', 'dGitProvider')
      await this.call(
        'dGitProvider',
        'clone',
        {url: 'https://github.com/vyperlang/vyper', token: null},
        // @ts-ignore
        'vyper-lang'
      )
      this.call(
        // @ts-ignore
        'notification',
        'toast',
        'Vyper repository cloned, the workspace Vyper has been created.'
      )
    } catch (e) {
      // @ts-ignore
      this.call('notification', 'toast', e.message)
    }
  }

  /** Update the status of the plugin in remix */
  changeStatus(status: Status) {
    this.client.emit('statusChanged', status)
  }

  checkActiveTheme() {
    const active = this.client.call('theme', 'currentTheme')
    if (active === 'dark') {
      return 'monokai' as any
    }
  }

  /** Highlight a part of the editor */
  async highlight(lineColumnPos: HighlightPosition, name: string, message: string) {
    await this.client.call('editor', 'highlight', lineColumnPos, name)
    /*
    column: -1
      row: -1
      text: "browser/Untitled1.sol: Warning: SPDX license identifier not provided in source file. Before publishing, consider adding a comment containing "SPDX-License-Identifier: <SPDX-License>" to each source file. Use "SPDX-License-Identifier: UNLICENSED" for non-open-source code. Please see https://spdx.org for more information.↵"
      type: "warning"
    */
    const annotation = {
      column: 0,
      row: lineColumnPos.start.line,
      type: 'error',
      text: message
    }
    await this.client.call('editor', 'addAnnotation', annotation, name)
  }

  /** Remove current Hightlight */
  async discardHighlight() {
    await this.client.call('editor', 'discardHighlight')
    await this.client.call('editor', 'clearAnnotations')
  }

  /** Get the name of the current contract */
  async getContractName(): Promise<string> {
    await this.client.onload()
    return this.client.call('fileManager', 'getCurrentFile')
  }

  /** Get the current contract file */
  async getContract(): Promise<Contract> {
    const name = await this.getContractName()
    if (!name) throw new Error('No contract selected yet')
    const content = await this.client.call('fileManager', 'getFile', name)
    return {
      name,
      content
    }
  }

  /** Emit an event to Remix with compilation result */
  compilationFinish(title: string, content: string, data: CompilationResult) {
    this.client.emit('compilationFinished', title, content, 'vyper', data)
  }
}

export const remixClient = new RemixClient()
// export const RemixClientContext = React.createContext(new RemixClient())
