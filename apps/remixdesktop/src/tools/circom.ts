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

export function getInstallationPath(version = 'latest') {
  switch (process.platform) {
  case 'win32':
    return path.join(app.getPath('temp'), version, 'circom-windows-amd64.exe')

  case 'darwin':
    return path.join(app.getAppPath(), version, 'circom-macos-amd64')

  case 'linux':
    return path.join(app.getAppPath(), version, 'circom-linux-amd64')
  }
}

function getInstallationUrl(version = 'latest') {
  switch (process.platform) {
  case 'win32':
    return `https://github.com/iden3/circom/releases/${version}/download/circom-windows-amd64.exe`

  case 'darwin':
    return `https://github.com/iden3/circom/releases/${version}/download/circom-macos-amd64`

  case 'linux':
    return `https://github.com/iden3/circom/releases/${version}/download/circom-linux-amd64`
  }
}

export const circomCli = {
  async installCircom () {
    try {
      const installationPath = getInstallationPath()
      console.log('downloading circom to ', installationPath)
      const installationUrl = getInstallationUrl()
      await downloadFile(installationUrl, installationPath)
      console.log('downloading done')
    } catch (e) {
      console.error(e)
    }
  },

  async isCircomInstalled () {
    try {
      const installationPath = getInstallationPath()
      return existsSync(installationPath)
    } catch (e) {
      return false
    }
  },

  async run (filePath: string, options?: Record<string, string>) {
    const installationPath = getInstallationPath()
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