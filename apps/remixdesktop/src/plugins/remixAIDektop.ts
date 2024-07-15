import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
// import { IModel, ModelType, DefaultModels } from '@remix/remix-ai-core';

// use remix ai core
import { InferenceManager } from "../lib/InferenceServerManager"
import { cacheDir } from "../utils/config"
// import { isE2E } from "../main";

const profile = {
  name: 'remixAID',
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  kind: '',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/remixai.html',
}

export class RemixAIDesktopPlugin extends ElectronBasePlugin {
  clients: RemixAIDesktopPluginClient[] = []
  constructor() {
    console.log("loading the remix plugin main plugin ")
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
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  kind: '',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/remixai.html',
  methods: ['initializeModelBackend', 'code_completion', 'code_insertion', 'code_generation', 'code_explaining', 'error_explaining', 'solidity_answer']
}

class RemixAIDesktopPluginClient extends ElectronBasePluginClient {
  readonly modelCacheDir: string = cacheDir
  InferenceModel:InferenceManager = null

  constructor (webContentsId: number, profile: Profile){
    console.log("loading the remix plugin client ........................")
    super(webContentsId, profile)
  }

  async onActivation(): Promise<void> {
    console.log("Activation", "loaded the remix plugin client application side")
    this.onload(() => {
      this.emit('loaded')
      console.log("loaded the remix plugin client application side")
    })
  }

  async enable (){
    console.log('Remix AI desktop plugin enabled')
    this.emit('enabled')
  }

  async initializeModelBackend(multitaskModel: any){
    if (this.InferenceModel === null) {
      console.log('Initializing Inference model')
      this.InferenceModel = InferenceManager.getInstance(multitaskModel, this.modelCacheDir)
      if (!this.InferenceModel.isReady) this.InferenceModel.init()
    } else {
      console.log('Inference model already initialized')
    }
  }

  async code_completion(context: any) {
    // use general purpose model
    return this.InferenceModel.code_completion(context)
  }

  async code_insertion(msg_pfx: string, msg_sfx: string) {
    return this.InferenceModel.code_insertion(msg_pfx, msg_sfx)
  }

  changemodel(newModel: any){
    /// dereference the current static inference object
    /// set new one
  }

}

