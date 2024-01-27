import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { autoUpdater } from "electron"
import { profile } from "node:console"

export class appUpdaterPlugin extends ElectronBasePlugin {
  constructor() {
    super(profile, clientProfile, appUpdaterPluginClient)
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'appUpdater',
  displayName: 'appUpdater',
  description: 'appUpdater',
  methods: ['checkForUpdates'],
}

class appUpdaterPluginClient extends ElectronBasePluginClient {
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
  }

  async onActivation(): Promise<void> {
    console.log('onActivation', 'appUpdaterPluginClient')
    this.onload(() => {
      console.log('onload', 'appUpdaterPluginClient')
      this.emit('loaded')
    })
  }

  async checkForUpdates(): Promise<void> {
    console.log('checkForUpdates')
    autoUpdater.checkForUpdates()
  }
}

export default appUpdaterPlugin
