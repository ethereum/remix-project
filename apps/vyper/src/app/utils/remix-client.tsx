import { HighlightPosition, CompilationResult, RemixApi } from '@remixproject/plugin-api';
import { Api, Status } from '@remixproject/plugin-utils';
import { createClient } from '@remixproject/plugin-webview'
import { PluginClient } from '@remixproject/plugin';
import { Contract } from './compiler';

export class RemixClient extends PluginClient {
  private client = createClient<Api, Readonly<RemixApi>>(this);

  loaded() {
    return this.client.onload()
  }

  /** Emit an event when file changed */
  async onFileChange(cb: (contract: string) => any) {
    this.client.on('fileManager', 'currentFileChanged', async (name: string) => {
      if (!name) return
      cb(name)
    })
  }

  /** Load Ballot contract example into the file manager */
  async loadContract({name, content}: Contract) {
    try {
      await this.client.call('fileManager', 'setFile', name, content)
      await this.client.call('fileManager', 'switchFile', name)
    } catch (err) {
      console.log(err)
    }
  }

  /** Update the status of the plugin in remix */
  changeStatus(status: Status) {
    this.client.emit('statusChanged', status);
  }

  /** Highlight a part of the editor */
  highlight(lineColumnPos: HighlightPosition, name: string, color: string) {
    return this.client.call('editor', 'highlight', lineColumnPos, name, color)
  }

  /** Remove current Hightlight */
  discardHighlight() {
    return this.client.call('editor', 'discardHighlight')
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
      content,
    }
  }

  /** Emit an event to Remix with compilation result */
  compilationFinish(title: string, content: string, data: CompilationResult) {
    this.client.emit('compilationFinished', title, content, 'vyper', data);
  }
}

export const remixClient = new RemixClient()
// export const RemixClientContext = React.createContext(new RemixClient())