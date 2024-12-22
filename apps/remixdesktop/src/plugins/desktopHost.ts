import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { handleRequest, startRPCServer } from "../lib/server"
import EventEmitter from "events"
import { shell } from "electron"
import { RequestArguments } from "../types"

const profile = {
    displayName: 'desktopHost',
    name: 'desktopHost',
    description: 'desktopHost',
}

const eventEmitter = new EventEmitter()
let isConnected = false

export class DesktopHostPlugin extends ElectronBasePlugin {
    clients: DesktopHostPluginClient[] = []
    constructor() {
        super(profile, clientProfile, DesktopHostPluginClient)
        this.methods = [...super.methods]
        this.startServer()
        eventEmitter.on('connected', (payload) => {
            console.log('connected', payload)
            isConnected = payload
        })
    }

    async startServer(): Promise<void> {
        console.log('desktopHost activated')
        startRPCServer(eventEmitter)
    }
}

const clientProfile: Profile = {
    name: 'desktopHost',
    displayName: 'desktopHost',
    description: 'desktopHost',
    methods: ['getIsConnected', 'sendAsync', 'init'],
    kind: 'provider',
}

export class DesktopHostPluginClient extends ElectronBasePluginClient {
    constructor(webContentsId: number, profile: Profile) {
        super(webContentsId, profile)
    }

    getIsConnected() {
        console.log('getIsConnected', isConnected)
        return isConnected
    }

    async init() {
        console.log('initializing destkophost plugin...')
        if(!isConnected)
            await shell.openExternal('http://localhost:8080/?activate=udapp,desktopClient')
        // wait for the connection
        while (!isConnected) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    async sendAsync(data: RequestArguments) {
        console.log('SEND ASYNC', data)
        return handleRequest(data)
    }
}