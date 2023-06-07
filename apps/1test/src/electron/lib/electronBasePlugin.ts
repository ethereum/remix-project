import { Plugin } from "@remixproject/engine";
import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { BrowserWindow } from "electron";
import { createElectronClient } from "./electronPluginClient";

export interface ElectronBasePluginInterface {
  createClient(windowId: number): Promise<boolean>;
  closeClient(windowId: number): Promise<boolean>;
}

export abstract class ElectronBasePlugin extends Plugin implements ElectronBasePluginInterface {
  clients: ElectronBasePluginClient[] = [];
  clientClass: any
  clientProfile: Profile
  constructor(profile: Profile, clientProfile: Profile, clientClass: any) {
    super(profile);
    this.methods = ['createClient', 'closeClient'];
    this.clientClass = clientClass;
    this.clientProfile = clientProfile;
  }

  async createClient(webContentsId: number): Promise<boolean> {
    if (this.clients.find(client => client.webContentsId === webContentsId)) return true
    const client = new this.clientClass(webContentsId, this.clientProfile);
    this.clients.push(client);
    return new Promise((resolve, reject) => {
      client.onload(() => {
        resolve(true)
      })
    })
  }
  async closeClient(windowId: number): Promise<boolean> {
    this.clients = this.clients.filter(client => client.webContentsId !== windowId)
    return true;
  }
}

export class ElectronBasePluginClient extends PluginClient {
  window: Electron.BrowserWindow;
  webContentsId: number;
  constructor(webcontentsid: number, profile: Profile, methods: string[] = []) {
    super();
    this.methods = profile.methods;
    this.webContentsId = webcontentsid;
    BrowserWindow.getAllWindows().forEach((window) => {
      if (window.webContents.id === webcontentsid) {
        this.window = window;
      }
    });
    createElectronClient(this, profile, this.window);
  }
}

