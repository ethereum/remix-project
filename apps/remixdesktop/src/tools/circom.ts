import { app } from 'electron'
import { promisify } from 'util'
import { exec } from 'child_process'
import { gitProxy } from './git'
import path from 'path'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

export const circomCli = {
  async installRustup () {
    try {
      console.log('installing rustup')
      const { stdout } = await execAsync(`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`)

      console.log('stdout: ', stdout)
    } catch (e) {
      console.error(e)
    }
  },

  async installCircom () {
    try {
      const appPath = app.getAppPath()
      const targetPath = path.join(appPath, 'bin')

      console.log('cloning circom repo to ' + targetPath)
      if (!existsSync(`${targetPath}/circom`)) await gitProxy.clone('https://github.com/iden3/circom.git', targetPath)
      console.log('builing circom with cargo')
      await execAsync(`cd ${targetPath}/circom && cargo build --release && cargo install --path circom`)
    } catch (e) {
      console.error(e)
    }
  },

  async isCircomInstalled () {
    try {
      await execAsync(`circom --version`)

      return true
    } catch (e) {
      return false
    }
  },

  async isCargoInstalled () {
    try {
      await execAsync(`cargo version`)

      return true
    } catch (e) {
      return false
    }
  }
}