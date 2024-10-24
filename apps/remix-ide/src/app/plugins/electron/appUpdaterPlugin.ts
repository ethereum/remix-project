import { ElectronPlugin } from '@remixproject/engine-electron'

const profile = {
  displayName: 'appUpdater',
  name: 'appUpdater',
  description: 'appUpdater',
}

export class appUpdaterPlugin extends ElectronPlugin {
  constructor() {
    super(profile)
  }

  onActivation(): void {
    this.on('appUpdater', 'askForUpdate', () => {
      console.log('askForUpdate')
      const upgradeModal = {
        id: 'confirmUpdate',
        title: 'An update is available',
        message: `A new version of Remix Desktop is available. Do you want to update?`,
        modalType: 'modal',
        okLabel: 'Yes',
        cancelLabel: 'No',
        okFn: () => {
          this.call('appUpdater', 'download')
        },
        cancelFn: () => {

        },
        hideFn: () => null
      }
      this.call('notification', 'modal', upgradeModal)
    })
    this.on('appUpdater', 'downloadReady', () => {
      console.log('downloadReady')
      const upgradeModal = {
        id: 'confirmInstall',
        title: 'An update is ready to install',
        message: `A new version of Remix Desktop is ready to install. Do you want to install it now? This will close Remix Desktop.`,
        modalType: 'modal',
        okLabel: 'Yes',
        cancelLabel: 'No',
        okFn: () => {
          this.call('appUpdater', 'install')
        },
        cancelFn: () => {

        },
        hideFn: () => null
      }
      this.call('notification', 'modal', upgradeModal)
    })
  }
}