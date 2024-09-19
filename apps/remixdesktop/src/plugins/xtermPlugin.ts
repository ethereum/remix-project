import {PluginClient} from '@remixproject/plugin'
import {Profile} from '@remixproject/plugin-utils'
import {ElectronBasePlugin, ElectronBasePluginClient} from '@remixproject/plugin-electron'

import os from 'os'
import * as pty from 'node-pty'
import process from 'node:process'
import {userInfo} from 'node:os'
import {findExecutable} from '../utils/findExecutable'
import {exec, spawnSync} from 'child_process'
import {stripAnsi} from '../lib'
import {DataBatcher} from '../lib/databatcher'

export const detectDefaultShell = () => {
  const {env} = process

  if (process.platform === 'win32') {
    return env.SHELL || 'powershell.exe'
  }

  try {
    const {shell} = userInfo()
    if (shell) {
      return shell
    }
  } catch {}

  if (process.platform === 'darwin') {
    return env.SHELL || '/bin/zsh'
  }

  return env.SHELL || '/bin/sh'
}

// Stores default shell when imported.
const defaultShell = detectDefaultShell()

const getShellEnvArgs = ['-ilc', 'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit']

const getShellEnvEnv = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: 'true',
}

const parseEnv = (env: any) => {
  env = env.split('_SHELL_ENV_DELIMITER_')[1]
  const returnValue = {}

  for (const line of stripAnsi(env)
    .split('\n')
    .filter((l) => Boolean(l))) {
    const [key, ...values] = line.split('=')
    Object.assign(returnValue, {
      [key]: values.join('='),
    })
  }

  return returnValue
}

export default defaultShell

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
    const client = this.clients.find((c) => c.webContentsId === webContentsId)
    console.log('new terminal', webContentsId)
    if (client) {
      console.log('client exists')
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
  methods: ['createTerminal', 'closeTerminal', 'keystroke', 'getShells', 'resize'],
}

class XtermPluginClient extends ElectronBasePluginClient {
  terminals: pty.IPty[] = []
  dataBatchers: DataBatcher[] = []
  workingDir: string = ''
  parsedEnv: any = null
  constructor(webContentsId: number, profile: Profile) {
    super(webContentsId, profile)
    this.onload(async () => {
      this.emit('loaded')
      this.on('fs' as any, 'workingDirChanged', async (path: string) => {
        this.workingDir = path
      })
      this.workingDir = await this.call('fs' as any, 'getWorkingDir')
      console.log('workingDir', this.workingDir)
    })

    if (!(process.platform === 'win32')) {
      const {stdout} = spawnSync(defaultShell, getShellEnvArgs, {
        encoding: 'utf8',
      })
      this.parsedEnv = parseEnv(stdout)
    }
  }

  async keystroke(key: string, pid: number): Promise<void> {
    this.terminals[pid].write(key)
  }

  async getShells(): Promise<string[]> {
    if (os.platform() === 'win32') {
      let bash = await findExecutable('bash.exe')
      if (bash.length === 0) {
        bash = await findExecutable('bash.exe', undefined, [process.env['ProgramFiles'] + '\\Git\\bin'])
      }
      if (bash) {
        const shells = ['powershell.exe', 'cmd.exe', ...bash]
        // filter out duplicates
        return shells.filter((v, i, a) => a.indexOf(v) === i)
      }
      return ['powershell.exe', 'cmd.exe']
    }
    return [defaultShell]
  }

  async createTerminal(path?: string, shell?: string): Promise<number> {
    const start_time = Date.now()
    console.log('createTerminal', path, shell || defaultShell)

    const env = this.parsedEnv || process.env

    const ptyProcess = pty.spawn(shell || defaultShell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 20,
      cwd: path || this.workingDir || process.cwd(),
      env: env,
      encoding: 'utf8',
    })
    const dataBatcher = new DataBatcher(ptyProcess.pid)
    this.dataBatchers[ptyProcess.pid] = dataBatcher
    ptyProcess.onData((data: string) => {
      dataBatcher.write(Buffer.from(data))
    })
    ptyProcess.onExit(() => {
      const pid = ptyProcess.pid
      this.closeTerminal(pid)
    })
    dataBatcher.on('flush', (data: string, uid: number) => {
      this.sendData(data, uid)
    })
    this.terminals[ptyProcess.pid] = ptyProcess
    const end_time = Date.now()
    console.log('createTerminal', end_time - start_time)
    return ptyProcess.pid
  }

  async closeTerminal(pid: number): Promise<void> {
    console.log('closeTerminal', pid)

    try {
      if (this.terminals) {

        if (this.dataBatchers[pid]) delete this.dataBatchers[pid]

        if (this.terminals[pid]) {
          try {
            if (os.platform() === 'win32') {
              // For Windows, use taskkill to terminate the process
              exec(`taskkill /PID ${pid} /T /F`, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error killing process: ${error}`);
                }else{
                  console.log(`stdout: ${stdout}`);
                  console.error(`stderr: ${stderr}`);
                }
              });
            } else {
              this.terminals[pid].kill();
            }
          } catch (err) {
            console.error(err)
            // ignore
          }
          delete this.terminals[pid]
        }
      }
      this.emit('close', pid)
    } catch (err) {
      console.error(err)
    }

  }

  async resize({cols, rows}: {cols: number; rows: number}, pid: number) {
    if (this.terminals[pid]) {
      try {
        this.terminals[pid].resize(cols, rows)
      } catch (_err) {
        const err = _err as {stack: any}
        console.error(err.stack)
      }
    } else {
      console.warn('Warning: Attempted to resize a session with no pty')
    }
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
    this.emit('new')
  }
}
