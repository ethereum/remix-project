import { PluginManager } from "@remixproject/engine"
import axios from 'axios'
export class VscodeAppManager extends PluginManager {
    pluginsDirectory:string
    target:string
    constructor () {
      super()
      this.pluginsDirectory = 'https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json'
      this.target = "vscode"
    }

    async registeredPluginData () {
        let plugins
        try {
            plugins = await axios.get(this.pluginsDirectory)
            return plugins.data.filter((p:any)=>(p.targets && p.targets.includes(this.target)))
          } catch (e) {
            throw new Error("Could not fetch plugin profiles.")
          }
    }
}