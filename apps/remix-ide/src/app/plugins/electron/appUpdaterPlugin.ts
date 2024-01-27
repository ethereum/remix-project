import { ElectronPlugin } from '@remixproject/engine-electron'

const profile = {
    displayName: 'appUpdater',
    name: 'appUpdater',
    description: 'appUpdater',
}

export class appUpdaterPlugin extends ElectronPlugin {
    constructor() {
        console.log('appUpdaterPlugin')
        super(profile)
    }
}