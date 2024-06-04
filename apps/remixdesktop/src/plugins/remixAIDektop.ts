import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { app } from 'electron';
// import { isE2E } from "../main";

const profile = {
  name: 'remixAI',
  displayName: 'Remix AI',
  methods: [''],
  events: [],
  icon: 'assets/img/remix-logo-blue.png',
  description: 'Remix AI provides AI services to Remix IDE.',
  kind: '',
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/remixai.html',
  maintainedBy: 'Remix'
}

export class RemixAIPlugin extends ElectronBasePlugin {
  clients: RemixAIPluginClient[] = []
  constructor() {
    console.log("loading the remix plugin")
    super(profile, clientProfile, RemixAIPluginClient)
    this.methods = [...super.methods]

    for (const client of this.clients) {
      console.log(client)
      client.enable()
    }
  }
}

const clientProfile: Profile = {
  name: 'remixAI',
  displayName: 'remixAI',
  description: 'remixAI',
  methods: ['enable'],
}

class RemixAIPluginClient extends ElectronBasePluginClient {
  constructor (webContentsId: number, profile: Profile){
    console.log("loading the remix plugin client")
    console.log("loading the remix plugin client ........................")
    super(webContentsId, profile)
  }

  async onActivation(): Promise<void> {
    console.log("Activation", "loaded the remix plugin client")
    this.onload(() => {
      this.emit('loaded')
      console.log("loaded the remix plugin client")
    })
  }
  async listAvailableModels(){

  }

  async enable (){
    console.log('Remix AI desktop plugin enabled')
    this.emit('enabled')
  }

}

