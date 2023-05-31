import { ClientConnector, connectClient, applyApi, Client, PluginClient } from '@remixproject/plugin'
import type { Message, Api, ApiMap } from '@remixproject/plugin-utils'
import { IRemixApi } from '@remixproject/plugin-api'
import { ipcMain } from 'electron'
import { mainWindow } from '..'

export class ElectronPluginClientConnector implements ClientConnector {

    constructor(public IPCName: string) { 
        console.log('ElectronPluginClientConnector constructor', IPCName)
    }


    /** Send a message to the engine */
    send(message: Partial<Message>) {
        console.log('ElectronPluginConnector send', message)
        mainWindow.webContents.send(this.IPCName + ':send', message)
    }

    /** Listen to message from the engine */
    on(cb: (message: Partial<Message>) => void) {
        console.log('ElectronPluginConnector on', cb)
        ipcMain.on(this.IPCName + ':on', (event, message) => {
            console.log('ElectronPluginConnector on message received', message)
            cb(message)
        })
    }
}

export const createClient = <
    P extends Api,
    App extends ApiMap = Readonly<IRemixApi>
>(client: PluginClient<P, App> = new PluginClient(), IPCName: string): Client<P, App> => {
    const c = client as any
    connectClient(new ElectronPluginClientConnector(IPCName), c)
    applyApi(c)
    return c
}