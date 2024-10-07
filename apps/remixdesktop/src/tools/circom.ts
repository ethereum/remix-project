import { app } from 'electron'
import { promisify } from 'util'
import { exec } from 'child_process'
import path from 'path'
import fs, { existsSync } from 'fs'
import axios from 'axios'

const execAsync = promisify(exec)

async function downloadFile(url: string, dest: string) {
  const writer = fs.createWriteStream(dest)
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      if (process.platform !== 'win32') {
        // Sets permission to make the file executable
        fs.chmod(dest, 0o755, (err) => {
          if (err) {
            reject(`Error making file executable: ${err}`)
          } else {
            resolve(dest)
          }
        })
      }
      resolve(true)
    })
    writer.on('error', reject)
  })
}

export function getInstallationPath(version) {
  switch (process.platform) {
  case 'win32':
    return path.join(app.getPath('temp'), 'circom-download', version, 'circom-windows-amd64.exe')

  case 'darwin':
    return path.join(app.getAppPath(), 'circom-download', version, 'circom-macos-amd64')

  case 'linux':
    return path.join(app.getAppPath(), 'circom-download', version, 'circom-linux-amd64')
  }
}

export function getInstallationUrl(version) {
  switch (process.platform) {
  case 'win32':
    return version === 'latest' ? 'https://github.com/iden3/circom/releases/latest/download/circom-windows-amd64.exe' : `https://github.com/iden3/circom/releases/download/${version}/circom-windows-amd64.exe`

  case 'darwin':
    return version === 'latest' ? 'https://github.com/iden3/circom/releases/latest/download/circom-macos-amd64' : `https://github.com/iden3/circom/releases/download/${version}/circom-macos-amd64`

  case 'linux':
    return version === 'latest' ? 'https://github.com/iden3/circom/releases/latest/download/circom-linux-amd64' : `https://github.com/iden3/circom/releases/download/${version}/circom-linux-amd64`
  }
}

export function getLogInputSignalsPath() {
  switch (process.platform) {
  case 'win32':
    return path.join(app.getPath('temp'), 'log_input_signals.txt')

  case 'darwin':
    return path.join(app.getAppPath(), 'log_input_signals.txt')

  case 'linux':
    return path.join(app.getAppPath(), 'log_input_signals.txt')
  }
}

export const circomCli = {
  async installCircom (version) {
    const installationPath = getInstallationPath(version)
    const installationUrl = getInstallationUrl(version)

    if (!existsSync(path.dirname(installationPath))) fs.mkdirSync(path.dirname(installationPath), { recursive: true })
    try {
      await downloadFile(installationUrl, installationPath)
    } catch (e) {
      fs.rmSync(installationPath)
      throw new Error('Download failed!')
    }
  },

  async isCircomInstalled (version) {
    try {
      const installationPath = getInstallationPath(version)
      return existsSync(installationPath)
    } catch (e) {
      return false
    }
  },

  async run (filePath: string, version: string, options?: Record<string, string>) {
    const installationPath = getInstallationPath(version)
    const cmd = `${installationPath} ${filePath} ${Object.keys(options || {}).map((key) => options[key] ? `--${key} ${options[key]}` : `--${key}`).join(' ')}`

    return await execAsync(cmd)
  }
}

export const extractParentFromKey = (key: string):string => {
  if (!key) return
  const keyPath = key.split('/')

  keyPath.pop()

  return keyPath.join('/')
}
