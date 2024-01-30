import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { autoUpdater } from "electron-updater"

const profile = {
  displayName: 'appUpdater',
  name: 'appUpdater',
  description: 'appUpdater',
}

export class AppUpdaterPlugin extends ElectronBasePlugin {
  clients: AppUpdaterPluginClient[] = []
  constructor() {
    console.log('AppUpdaterPlugin')
    super(profile, clientProfile, AppUpdaterPluginClient)
    this.methods = [...super.methods]

    autoUpdater.autoDownload = false

    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
      this.sendToLog('Checking for update...')
    })
    autoUpdater.on('update-available', (info: any) => {
      console.log('Update available.', info);
      this.sendToLog('Update available.')
      for (const client of this.clients) {
        client.askForUpdate()
      }
    })
    autoUpdater.on('update-not-available', () => {
      console.log('Update not available.');
      this.sendToLog('App is already up to date.')

    })
    autoUpdater.on('error', (err) => {
      console.log('Error in auto-updater. ' + err);
      this.sendToLog('Cannot find updates...')
    })
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      console.log(log_message);
      this.sendToLog(log_message)
    })
    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded');
      this.sendToLog('Update downloaded')
      for(const client of this.clients) {
        client.downloadReady()
      }
    })
  }

  async sendToLog(message: string): Promise<void> {
    for (const client of this.clients) {
      client.call('terminal', 'log', {
        type: 'log',
        value: message,
      })
    }
  }

}

const clientProfile: Profile = {
  name: 'appUpdater',
  displayName: 'appUpdater',
  description: 'appUpdater',
  methods: ['checkForUpdates', 'download', 'install'],
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
      await this.checkForUpdates()
    })
  }

  async askForUpdate(): Promise<void> {
    this.emit('askForUpdate')
  }

  async downloadReady(): Promise<void> {
    this.emit('downloadReady')
  }

  async download(): Promise<void> {
    autoUpdater.downloadUpdate()
  }

  async install(): Promise<void> {
    autoUpdater.quitAndInstall()
  }

  async checkForUpdates(): Promise<void> {
    console.log('checkForUpdates')
    this.call('terminal', 'log', {
      type: 'log',
      value: 'Remix Desktop version: ' + autoUpdater.currentVersion,
    })
    autoUpdater.checkForUpdates()
  }
}

