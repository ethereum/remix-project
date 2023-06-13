import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

import { Profile } from "@remixproject/plugin-utils";

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

    async writeConfig(webContentsId: any, data: any): Promise<void> {
        const client = this.clients.find(c => c.webContentsId === webContentsId)
        if (client) {
            client.writeConfig(data)
        }
    }

    async readConfig(webContentsId: any): Promise<any> {
        const client = this.clients.find(c => c.webContentsId === webContentsId)
        if (client) {
            return client.readConfig()
        }
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
        this.onload(() => {
            //console.log('config client onload')
        })
    }

    async writeConfig(data: any): Promise<void> {

    }

    async readConfig(): Promise<any> {

    }

}