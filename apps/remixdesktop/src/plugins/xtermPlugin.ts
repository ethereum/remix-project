import { PluginClient } from "@remixproject/plugin";
import { Profile } from "@remixproject/plugin-utils";
import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"

import os from 'os';
import * as pty from "node-pty"

import process from 'node:process';
import {userInfo} from 'node:os';

export const detectDefaultShell = () => {
	const {env} = process;

	if (process.platform === 'win32') {
		return env.SHELL || 'powershell.exe';
	}

	try {
		const {shell} = userInfo();
		if (shell) {
			return shell;
		}
	} catch {}

	if (process.platform === 'darwin') {
		return env.SHELL || '/bin/zsh';
	}

	return env.SHELL || '/bin/sh';
};

// Stores default shell when imported.
const defaultShell = detectDefaultShell();

console.log('defaultShell', defaultShell)

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
    }

}

const clientProfile: Profile = {
    name: 'xterm',
    displayName: 'xterm',
    description: 'xterm plugin',
    methods: ['createTerminal', 'close', 'keystroke']
}

class XtermPluginClient extends ElectronBasePluginClient {

    terminals: pty.IPty[] = []
    constructor(webContentsId: number, profile: Profile) {
        super(webContentsId, profile)
        this.onload(() => {
            console.log('XtermPluginClient onload')
        })
    }

    async keystroke(key: string, pid: number): Promise<void> {
        this.terminals[pid].write(key)
    }

    async createTerminal(path?: string): Promise<number> {
        const shell = defaultShell;

        console.log('defaultShell', defaultShell)

        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: path || process.cwd(),
            //env: process.env
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

    async sendData(data: string, pid: number) {
        this.emit('data', data, pid)
    }

}