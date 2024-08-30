import { app } from 'electron'
import { promisify } from 'util'
import { exec } from 'child_process'
import path from 'path'
import fs, { existsSync } from 'fs'
import axios from 'axios'

const execAsync = promisify(exec)
const CIRCOM_INSTALLATION_PATH = getInstallationPath()
const CIRCOM_INSTALLATION_URL = getInstallationUrl()

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

function getInstallationPath() {
  switch (process.platform) {
  case 'win32':
    return path.join(app.getPath('temp'), 'circom-windows-amd64.exe')

  case 'darwin':
    return path.join(app.getAppPath(), 'circom-macos-amd64')

  case 'linux':
    return path.join(app.getAppPath(), 'circom-linux-amd64')
  }
}

function getInstallationUrl() {
  switch (process.platform) {
  case 'win32':
    return "https://github.com/iden3/circom/releases/latest/download/circom-windows-amd64.exe"

  case 'darwin':
    return "https://github.com/iden3/circom/releases/latest/download/circom-macos-amd64"

  case 'linux':
    return "https://github.com/iden3/circom/releases/latest/download/circom-linux-amd64"
  }
}

export const circomCli = {
  async installCircom () {
    try {
      console.log('downloading circom to ', CIRCOM_INSTALLATION_PATH)
      await downloadFile(CIRCOM_INSTALLATION_URL, CIRCOM_INSTALLATION_PATH)
      console.log('downloading done')
    } catch (e) {
      console.error(e)
    }
  },

  async isCircomInstalled () {
    try {
      return existsSync(CIRCOM_INSTALLATION_PATH)
    } catch (e) {
      return false
    }
  },

  async run (filePath: string, options?: Record<string, string>) {
    const cmd = `${CIRCOM_INSTALLATION_PATH} ${filePath} ${Object.keys(options || {}).map((key) => `--${key} ${options[key]}`).join(' ')}`
    console.log('cmd: ', cmd)
    const { stdout, stderr } = await execAsync(cmd)

    if (stderr) return console.error(stderr)
    console.log(stdout)
  }
}

export const extractParentFromKey = (key: string):string => {
  if (!key) return
  const keyPath = key.split('/')

  keyPath.pop()

  return keyPath.join('/')
}