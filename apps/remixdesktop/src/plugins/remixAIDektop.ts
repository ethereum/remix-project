import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { app } from 'electron';
// import { isE2E } from "../main";

const profile = {
  name: 'remixAID',
  displayName: 'RemixAI desktop',
  methods: [''],
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  maintainedBy: 'Remix',
}

export class RemixAIDesktopPlugin extends ElectronBasePlugin {
  clients: RemixAIDesktopPluginClient[] = []
  constructor() {
    console.log("loading the remix plugin")
    super(profile, clientProfile, RemixAIDesktopPluginClient)
    this.methods = [...super.methods]

    for (const client of this.clients) {
      console.log(client)
      client.enable()
    }
  }
}

const clientProfile: Profile = {
  name: 'remixAID',
  displayName: 'RemixAI desktop',
  methods: ['enable'],
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  maintainedBy: 'Remix',
}

class RemixAIDesktopPluginClient extends ElectronBasePluginClient {
  constructor (webContentsId: number, profile: Profile){
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

