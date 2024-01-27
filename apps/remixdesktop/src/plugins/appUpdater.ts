import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { autoUpdater } from "electron-updater"

const profile = {
  displayName: 'appUpdater',
  name: 'appUpdater',
  description: 'appUpdater',
}

export class AppUpdaterPlugin extends ElectronBasePlugin {
  constructor() {
    console.log('AppUpdaterPlugin')
    super(profile, clientProfile, AppUpdaterPluginClient)
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'appUpdater',
  displayName: 'appUpdater',
  description: 'appUpdater',
  methods: ['checkForUpdates'],
}

class AppUpdaterPluginClient extends ElectronBasePluginClient {
  constructor(webContentsId: number, profile: Profile) {
    console.log('AppUpdaterPluginClient')
    super(webContentsId, profile)
  }

  async onActivation(): Promise<void> {
    console.log('onActivation', 'appUpdaterPluginClient')
    this.onload(async () => {
      console.log('onload', 'appUpdaterPluginClient')
      this.emit('loaded')
      
      autoUpdater.on('checking-for-update', () => {
        console.log('Checking for update...');
        this.call('terminal', 'log', {
          type: 'log',
          value: 'Checking for update...',
        })
      })
      autoUpdater.on('update-available', (info: any) => {
        console.log('Update available.', info);
        this.call('terminal', 'log', {
          type: 'log',
          value: 'Update available.',
        })
       })
       autoUpdater.on('update-not-available', () => {
         console.log('Update not available.');
          this.call('terminal', 'log', {
            type: 'log',
            value: 'Update not available.',
          })
       })
       autoUpdater.on('error', (err) => {
         console.log('Error in auto-updater. ' + err);
          this.call('terminal', 'log', {
            type: 'log',
            value: 'Error in auto-updater. ' + err,
          })
       })
       autoUpdater.on('update-downloaded', (info) => {
         console.log('Update downloaded');
          this.call('terminal', 'log', {
            type: 'log',
            value: 'Update downloaded',
          })
          autoUpdater.quitAndInstall();
       })
       await this.checkForUpdates()
    })

  }
 
  async checkForUpdates(): Promise<void> {
    console.log('checkForUpdates')
    this.call('terminal', 'log', {
      type: 'log',
      value: 'Checking for updates...' + autoUpdater.getFeedURL() + autoUpdater.currentVersion,
    })
    autoUpdater.checkForUpdates()
  }
}

