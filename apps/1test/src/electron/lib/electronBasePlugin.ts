import { Plugin } from "@remixproject/engine";
import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { BrowserWindow } from "electron";
import { createElectronClient } from "./electronPluginClient";

export interface ElectronBasePluginInterface {
  createClient(windowId: number): Promise<void>;
  closeClient(windowId: number): Promise<void>;
}

export abstract class ElectronBasePlugin extends Plugin implements ElectronBasePluginInterface {
  clients: ElectronBasePluginClient[] = [];
  constructor(profile: Profile) {
    super(profile);
    this.methods = ['createClient', 'closeClient'];
  }

  async createClient(windowId: number): Promise<void> {
    console.log('createClient method not implemented');
  }
  async closeClient(windowId: number): Promise<void> {
    console.log('closeClient method not implemented');
  }
}

export class ElectronBasePluginClient extends PluginClient {
  window: Electron.BrowserWindow;
  webContentsId: number;
  constructor(webcontentsid: number, profile: Profile, methods: string[] = []) {
    super();
    console.log('ElectronBasePluginClient', profile);
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

