import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { handleRequest, startHostServer } from "../lib/server"
import EventEmitter from "events"
import { ipcMain, shell } from "electron"
import { RequestArguments } from "../types"
import fs from 'fs'
import path from 'path'

const logFilePath = path.join(__dirname, 'desktopHost.log')
console.log('logFilePath', logFilePath)
// Create or clear the log file
fs.writeFileSync(logFilePath, '', { flag: 'w' })
const profile = {
  displayName: 'desktopHost',
  name: 'desktopHost',
  description: 'desktopHost',
}

const eventEmitter = new EventEmitter()
let isConnected = false

let ports: {
  http_port: number
  websocket_port: number
}

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
    eventEmitter.on('isInjected', (isInjected: boolean) => {
      console.log('isInjected', isInjected)
      for (const client of this.clients) {
        client.setIsInjected(isInjected)
      }
    })
    eventEmitter.on('focus', () => {
      console.log('focus')
      ipcMain.emit('focus-window', 0)
    })
    eventEmitter.on('contextChanged', (context) => {
      console.log('contextChanged', context)
      for (const client of this.clients) {
        client.emit('chainChanged', context)
      }
    })
  }

  async startServer(): Promise<void> {
    console.log('desktopHost activated')
    ports = await startHostServer(eventEmitter)
    console.log('desktopHost server started', ports)
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
  isConnected: boolean
  isInjected: boolean
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.isConnected = null
    this.isInjected = null
    eventEmitter.on('connected', async (payload) => {
      console.log('CLIENT connected', payload)
      isConnected = payload
    })
  }

  setIsInjected(isInjected: boolean) {
    if (this.isInjected !== isInjected && isConnected) {
      this.isInjected = isInjected

      if (isInjected) {
        this.call('notification' as any, 'toast', 'You are now connected to Metamask!')
      } else {
        this.call('notification' as any, 'alert', {
          title: 'Metamask Wallet',
          id: isInjected ? 'Injected' : 'Not_injected',
          message: isInjected ? 'You are now connected to Metamask!' : 'You are not yet connected to Metamask. Please connect to Metamask in the browser.',
        })
      }
    }
  }

  setIsConnected(isConnected: boolean) {
    if (this.isConnected !== isConnected) {
      this.isConnected = isConnected
      this.call('notification' as any, 'alert', {
        title: 'Metamask Wallet',
        id: isConnected ? 'Connected' : 'Disconnected',
        message: isConnected ? 'You are now connected to Remix on the web!' : 'You have been disconnected from Remix on the web. Please select another environment for deploy & run.',
      })
    }
  }

  async disconnect() {
    this.call('notification' as any, 'alert', {
      id: 'Connection lost',
      message: 'You have been disconnected from Remix on the web. Please select another environment for deploy & run.',
    })
  }

  getIsConnected() {
    console.log('getIsConnected', isConnected)
    return isConnected
  }

  async init() {
    console.log('SETTING UP REMOTE WEBSOCKET...', this.webContentsId)

    if (!isConnected)
      await shell.openExternal(`http://localhost:${ports.http_port}/?activate=udapp,desktopClient&desktopClientPort=${ports.websocket_port}`)
    // wait for the connection
    while (!isConnected) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    console.log('CONNECTED TO REMOTE WEBSOCKET', this.webContentsId)
  }



  async sendAsync(data: RequestArguments) {
    if (!isConnected) {
      console.log('NOT CONNECTED', this.webContentsId)
      return { error: 'Not connected to the remote websocket' }
    }
    console.log('SEND ASYNC', data, this.webContentsId)
    const provider = await this.call('blockchain' as any, 'getProvider')
      console.log('provider', provider)

    if (data.method === 'eth_getTransactionReceipt') {
      ipcMain.emit('focus-window', this.webContentsId)
    }
    const result = await handleRequest(data, eventEmitter)

    const logEntry = `
        webContentsId: ${this.webContentsId}
        Request: ${JSON.stringify(data, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2)}
        Result: ${JSON.stringify(result, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2)}
        `

    fs.appendFileSync(logFilePath, logEntry)
    return result
  }
}