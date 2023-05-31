import { PluginClient } from "@remixproject/plugin";
import { createClient } from "./electronPluginClient"
import { Engine, PluginManager, Plugin } from '@remixproject/engine';
import fs from 'fs'
import { existsSync } from "fs-extra";

const profile = {
  displayName: 'fs',
  name: 'fs',
  description: 'fs',
}

export class fsPlugin extends Plugin {
  client: PluginClient
  constructor(){
    super(profile)
  }

  onActivation(): void {
    console.log('fsPlugin onActivation')
    this.client = new fsPluginClient()
  }
}

class fsPluginClient extends PluginClient {
  constructor(){
    super()
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists']
    createClient(this)
    this.onload()
  }

  async readdir(path: string): Promise<string[]> {
    // call node fs.readdir
    return fs.readdirSync(path)
  }

  async readFile(path: string): Promise<string> {
    return fs.readFileSync(path, 'utf8')
  }

  async writeFile(path: string, content: string): Promise<void> {
    return fs.writeFileSync(path, content, 'utf8')
  }

  async mkdir(path: string): Promise<void> {
    return fs.mkdirSync(path)
  }

  async rmdir(path: string): Promise<void> {
    return fs.rmdirSync(path)
  }

  async unlink(path: string): Promise<void> {
    return fs.unlinkSync(path)
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return fs.renameSync(oldPath, newPath)
  }

  async stat(path: string): Promise<fs.Stats> {
    return fs.statSync(path)
  }

  async exists(path: string): Promise<boolean> {
    return existsSync(path)
  }

}