import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
// import { IModel, ModelType, DefaultModels } from '@remix/remix-ai-core';

// use remix ai core
import { InferenceManager } from "../lib/InferenceServerManager"
import { cacheDir } from "../utils/config"
import { RemoteInferencer } from "../../../../libs/remix-ai-core/src/index"

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
  desktopInferencer:InferenceManager | RemoteInferencer = null

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

  async initializeModelBackend(local, generalModel?, completionModel?){
    if (local){
      console.log('Initializing Inference model locally')
      this.desktopInferencer = new RemoteInferencer()
    } else if (generalModel || completionModel){
      if (!this.desktopInferencer){
        console.log('Initializing Inference model')
        this.desktopInferencer = InferenceManager.getInstance(this.modelCacheDir)
        if (this.desktopInferencer instanceof InferenceManager && generalModel) await this.desktopInferencer.init(generalModel)
        if (this.desktopInferencer instanceof InferenceManager && completionModel) await this.desktopInferencer.init(completionModel)
      } else {
        console.log('Inference model already initialized')
        return false // do not set event listener twice
      }
    } else {
      throw new Error('No model provided')
    }

    // set event listeners
    this.desktopInferencer.event.on('onStreamResult', (data) => {
      this.emit('onStreamResult', data)
    })
    this.desktopInferencer.event.on('onInference', () => {
      this.emit('onInference')
    })
    this.desktopInferencer.event.on('onInferenceDone', () => {
      this.emit('onInferenceDone')
    })
    return true
  }

  async code_completion(context: any) {
    // use general purpose model
    return this.desktopInferencer.code_completion(context)
  }

  async code_insertion(msg_pfx: string, msg_sfx: string) {
    return this.desktopInferencer.code_insertion(msg_pfx, msg_sfx)
  }

  async code_generation(prompt: string) {
    return this.desktopInferencer.code_generation(prompt)
  }

  async code_explaining(code:string, context?:string) {
    return this.desktopInferencer.code_explaining(code, context)
  }

  async error_explaining(prompt: string) {
    return this.desktopInferencer.error_explaining(prompt)
  }

  async solidity_answer(prompt: string) {
    return this.desktopInferencer.solidity_answer(prompt)
  }

  changemodel(newModel: any){
    /// dereference the current static inference object
    /// set new one
  }

}

