import { Plugin } from "@remixproject/engine";
import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { spawn } from "child_process";
import { createElectronClient } from "@remixproject/plugin-electron"

import os from 'os';
import * as pty from "node-pty"
import { mainWindow } from "./main";

const profile: Profile = {
    name: 'xterm',
    displayName: 'xterm',
    description: 'xterm plugin',
}

export class XtermPlugin extends Plugin {
    client: PluginClient
    constructor() {
        super(profile)
    }

    onActivation(): void {
        this.client = new XtermPluginClient()
    }

}

class XtermPluginClient extends PluginClient {
    terminals: pty.IPty[] = []
    constructor() {
        super()
        this.methods = ['keystroke', 'createTerminal', 'close']
        createElectronClient(this, profile, mainWindow)
        this.onload(() => {
            console.log('XtermPluginClient onload')
        })
    }

    async keystroke(key: string, pid: number): Promise<void> {
        console.log('keystroke', key)
        this.terminals[pid].write(key)
    }

    async createTerminal(path?: string): Promise<number>{
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

        const ptyProcess = pty.spawn(shell, [], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: path || process.cwd() ,
          env: process.env as { [key: string]: string },
        });

        ptyProcess.onData((data: string) => {
            this.sendData(data, ptyProcess.pid);
        })
        this.terminals[ptyProcess.pid] = ptyProcess
        console.log('create terminal', ptyProcess.pid)
        return ptyProcess.pid
    }

    async close(pid: number): Promise<void>{
        this.terminals[pid].kill()
        delete this.terminals[pid]
        this.emit('close', pid)
    }

    async sendData(data: string, pid: number){
        this.emit('data', data, pid)
    }

}