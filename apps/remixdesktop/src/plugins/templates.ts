import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import * as templateWithContent from '@remix-project/remix-ws-templates'
import fs from 'fs/promises'
import { createWindow } from "../main";
import path from 'path'

const profile: Profile = {
  name: 'electronTemplates',
  displayName: 'electronTemplates',
  description: 'Templates plugin',
}

export class TemplatesPlugin extends ElectronBasePlugin {
  clients: TemplatesPluginClient[] = []
  constructor() {
    super(profile, clientProfile, TemplatesPluginClient)
  }

  openTemplate(webContentsId: any): void {
    const client = this.clients.find(c => c.webContentsId === webContentsId)
    if (client) {
      client.openTemplate()
    }
  }

}

const clientProfile: Profile = {
  name: 'electronTemplates',
  displayName: 'electronTemplates',
  description: 'Templates plugin',
  methods: ['loadTemplateInNewWindow', 'openTemplate'],
}

export type WorkspaceTemplate = 'gist-template' | 'code-template' | 'remixDefault' | 'blank' | 'ozerc20' | 'zeroxErc20' | 'ozerc721'

class TemplatesPluginClient extends ElectronBasePluginClient {

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
  }

  async loadTemplateInNewWindow (files: any) {

    let folder = await this.call('fs' as any, 'selectFolder', null ,'Select or create a folder to load the template in', 'Set as destination folder for the template')
    if (!folder || folder === '') return
    // @ts-ignore

    for (const file in files) {
      try {
        if(!folder.endsWith('/')) folder += '/'

        await fs.mkdir(path.dirname(folder + file), { recursive: true})
        await fs.writeFile(folder + file, files[file], {
          encoding: 'utf8'
        })
      } catch (error) {
        console.error(error)
      }
    }
    createWindow(folder)
  }

  async openTemplate(){
    this.call('filePanel' as any, 'loadTemplate')
  }

}


