import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

import os from 'os';
import * as pty from "node-pty"

import process from 'node:process';
import { userInfo } from 'node:os';
import { findExecutable } from "../utils/findExecutable";

export const detectDefaultShell = () => {
    const { env } = process;

    if (process.platform === 'win32') {
        return env.SHELL || 'powershell.exe';
    }

    try {
        const { shell } = userInfo();
        if (shell) {
            return shell;
        }
    } catch { }

    if (process.platform === 'darwin') {
        return env.SHELL || '/bin/zsh';
    }

    return env.SHELL || '/bin/sh';
};

// Stores default shell when imported.
const defaultShell = detectDefaultShell();


export default defaultShell;


const profile: Profile = {
    name: 'xterm',
    displayName: 'xterm',
    description: 'xterm plugin',
}

export class XtermPlugin extends ElectronBasePlugin {
    clients: XtermPluginClient[] = []
    constructor() {
        super(profile, clientProfile, XtermPluginClient)
        this.methods = [...super.methods, 'closeTerminals']
    }

    new(webContentsId: any): void {
        const client = this.clients.find(c => c.webContentsId === webContentsId)
        if (client) {
            client.new()
        }
    }

    async closeTerminals(): Promise<void> {
        for (const client of this.clients) {
          await client.closeAll()
        }
      }

}

const clientProfile: Profile = {
    name: 'xterm',
    displayName: 'xterm',
    description: 'xterm plugin',
    methods: ['createTerminal', 'close', 'keystroke', 'getShells']
}

class XtermPluginClient extends ElectronBasePluginClient {

    terminals: pty.IPty[] = []
    constructor(webContentsId: number, profile: Profile) {
        super(webContentsId, profile)
        this.onload(() => {
            this.emit('loaded')
        })
    }

    async keystroke(key: string, pid: number): Promise<void> {
        this.terminals[pid].write(key)
    }

    async getShells(): Promise<string[]> {
        if(os.platform() === 'win32') {
            const bash = await findExecutable('bash')
            if(bash) {
                return [bash, 'powershell.exe', 'cmd.exe']
            }
            return ['powershell.exe', 'cmd.exe']
        }
        return [defaultShell]
    }


    async createTerminal(path?: string, shell?: string): Promise<number> {


        // filter undefined out of the env
        const env = Object.keys(process.env)
            .filter(key => process.env[key] !== undefined)
            .reduce((env, key) => {
                env[key] = process.env[key] || '';
                return env;
            }, {} as Record<string, string>);
            

        const ptyProcess = pty.spawn(shell || defaultShell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 20,
            cwd: path || process.cwd(),
            env: env
        });

        ptyProcess.onData((data: string) => {
            this.sendData(data, ptyProcess.pid);
        })
        this.terminals[ptyProcess.pid] = ptyProcess

        return ptyProcess.pid
    }

    async close(pid: number): Promise<void> {
        this.terminals[pid].kill()
        delete this.terminals[pid]
        this.emit('close', pid)
    }

    async closeAll(): Promise<void> {
        for (const pid in this.terminals) {
            this.terminals[pid].kill()
            delete this.terminals[pid]
            this.emit('close', pid)
        }
    }


    async sendData(data: string, pid: number) {
        this.emit('data', data, pid)
    }

    async new(): Promise<void> {
    }

}