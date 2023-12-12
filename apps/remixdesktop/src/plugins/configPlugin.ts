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

  async writeConfig(data: any): Promise<void> {
    writeConfig(data)
  }

  async readConfig(): Promise<any> {
    return readConfig()
  }

}