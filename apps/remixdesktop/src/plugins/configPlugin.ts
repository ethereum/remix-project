import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

import { Profile } from "@remixproject/plugin-utils";
import { readConfig, writeConfig } from "../utils/config";
import { app, utilityProcess } from "electron";
import path from "path";

const profile: Profile = {
  displayName: 'electronconfig',
  name: 'electronconfig',
  description: 'Electron Config'
}

export class ConfigPlugin extends ElectronBasePlugin {
  clients: ConfigPluginClient[] = []
  constructor() {
    super(profile, clientProfile, ConfigPluginClient)
    this.methods = [...super.methods, 'writeConfig', 'readConfig']
  }

  async writeConfig(data: any): Promise<void> {
    writeConfig(data)
  }

  async readConfig(webContentsId: any): Promise<any> {
    return readConfig()
  }

}

const clientProfile: Profile = {
  name: 'electronconfig',
  displayName: 'electronconfig',
  description: 'Electron Config',
  methods: ['writeConfig', 'readConfig']
}

class ConfigPluginClient extends ElectronBasePluginClient {

  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)

  }

  async onActivation(): Promise<void> {
    //utilityProcess.fork('/Users/filipmertens/Documents/GitHub/remix-project/apps/remixdesktop/node_modules/yarn/bin/yarn.js')
    /*const child = utilityProcess.fork(path.join(__dirname, 'utility.js'), [app.getPath('userData')])
    this.call('terminal' as any, 'log', JSON.stringify(process.env))
    child.on('message', (data) => {
      console.log('message from child', data)
      this.call('terminal', 'log', data)
    })
    */
  }

  async writeConfig(data: any): Promise<void> {
    writeConfig(data)
  }

  async readConfig(): Promise<any> {
    return readConfig()
  }

}