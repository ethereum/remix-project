import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"

// use remix ai core
import { InferenceManager } from "../lib/InferenceServerManager"
import { cacheDir } from "../utils/config"
import { RemoteInferencer } from "@remix/remix-ai-core"

// import { isE2E } from "../main";

const profile = {
  name: 'remixAID',
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  kind: '',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/ai.html',
}

export class RemixAIDesktopPlugin extends ElectronBasePlugin {
  clients: RemixAIDesktopPluginClient[] = []
  constructor() {
    super(profile, clientProfile, RemixAIDesktopPluginClient)
    this.methods = [...super.methods]
  }
}

const clientProfile: Profile = {
  name: 'remixAID',
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  kind: '',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/ai.html',
  methods: ['initializeModelBackend', 'code_completion', 'code_insertion', 'code_generation', 'code_explaining', 'error_explaining', 'answer', 'generate']
}

class RemixAIDesktopPluginClient extends ElectronBasePluginClient {
  readonly modelCacheDir: string = cacheDir
  desktopInferencer:InferenceManager | RemoteInferencer = null

  constructor (webContentsId: number, profile: Profile){
    super(webContentsId, profile)
  }

  async onActivation(): Promise<void> {
    this.onload(() => {
      this.emit('activated')
    })
  }

  async enable (){
    console.log('RemixAI desktop plugin enabled')
    this.emit('enabled')
  }

  async initializeModelBackend(local, generalModel?, completionModel?){
    if (!local){
      this.desktopInferencer = new RemoteInferencer()
    } else if (generalModel || completionModel){
      if (!this.desktopInferencer){
        this.desktopInferencer = InferenceManager.getInstance(this.modelCacheDir)
        if (this.desktopInferencer instanceof InferenceManager && generalModel) await this.desktopInferencer.init(generalModel)
        if (this.desktopInferencer instanceof InferenceManager && completionModel) await this.desktopInferencer.init(completionModel)
      } else {
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

  async code_completion(prompt: string, promptAfter: string, ctxFiles=[], fileName: string="") {
    // use general purpose model
    return this.desktopInferencer.code_completion(prompt, promptAfter, ctxFiles, fileName)
  }

  async code_insertion(msg_pfx: string, msg_sfx: string, ctxFiles=[], fileName: string="") {
    return this.desktopInferencer.code_insertion(msg_pfx, msg_sfx, ctxFiles, fileName)
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

  async answer(prompt: string) {
    return this.desktopInferencer.answer(prompt)
  }

  async generate(userPrompt): Promise<any> {
    return this.desktopInferencer.generate(userPrompt)
  }

  changemodel(newModel: any){
    /// dereference the current static inference object
    /// set new one
  }

}

