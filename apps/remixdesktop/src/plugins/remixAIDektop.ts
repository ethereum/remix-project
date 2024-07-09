import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
// import { IModel, ModelType, DefaultModels } from '@remix/remix-ai-core';
//import { pipeline, env } from '@xenova/transformers';

// use remix ai core
import { InlineCompletionServiceTransformer, LLamaInferencer } from '../../../../libs/remix-ai-core/src/index'
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
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  kind: '',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/remixai.html',
  methods: ['initializeModelBackend', 'code_completion', 'code_insertion', 'code_generation', 'code_explaining', 'error_explaining', 'solidity_answer']
}

class RemixAIDesktopPluginClient extends ElectronBasePluginClient {
  multitaskModel: LLamaInferencer| InlineCompletionServiceTransformer = null
  completionModel: LLamaInferencer| InlineCompletionServiceTransformer = null
  readonly modelCacheDir: string = cacheDir

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

  async initializeModelBackend(multitaskModel: any, completionModel?: any){
    // console.log("Initializing backend with model ", multitaskModel, completionModel)
    // if (completionModel && completionModel.modelType === 'CODE_COMPLETION'){
    //   switch (completionModel.modelReqs.backend) {
    //   case 'llamacpp':
    //     this.completionModel = new LLamaInferencer(completionModel, this.modelCacheDir)
    //     break;
    //   case 'transformerjs':
    //     this.completionModel = new InlineCompletionServiceTransformer(completionModel, this.modelCacheDir)
    //     break;
    //   default:
    //     console.log("Backend not supported")
    //     break;
    //   }
    // }

    console.log("Initializing backend with model ", multitaskModel)
    switch (multitaskModel.modelReqs.backend) {
    case 'llamacpp':
      this.multitaskModel = new LLamaInferencer(multitaskModel, this.modelCacheDir)
      break;
    case 'transformerjs':
      this.multitaskModel = new InlineCompletionServiceTransformer(multitaskModel, this.modelCacheDir)
      break;
    default:
      console.log("Backend not supported")
      break;
    }

    // init the mmodels
    if (this.multitaskModel){
      await this.multitaskModel.init()
    }

    if (this.completionModel){
      await this.completionModel.init()
    }
  }

  async code_completion(context: any) {
    console.log("Code completion called")
    if (this.completionModel){
      return this.completionModel.code_completion(context)
    }

    // use general purpose model
    return this.multitaskModel.code_completion(context)
  }

  async code_insertion(msg_pfx: string, msg_sfx: string) {
    console.log("Code insertion called")
    if (this.completionModel){
      return this.completionModel.code_insertion(msg_pfx, msg_sfx)
    }

    // use general purpose model
    return this.multitaskModel.code_insertion(msg_pfx, msg_sfx)
  }

  // async _loadLocalModel(): Promise<LlamaChatSession> {
  //   if (!this.SelectedModelPath) {
  //     console.log('No model selected yet');
  //     return;
  //   }
  //   console.log('Loading model at ', this.SelectedModelPath);
  //   const model = new LlamaModel(this._getModelOptions());

  //   const context = new LlamaContext({model});
  //   const session = new LlamaChatSession({context});

  //   return session;
  // }

  // _getModelOptions(): LlamaModelOptions {

  //   const options: LlamaModelOptions = {
  //     modelPath: this.SelectedModelPath? this.SelectedModelPath: null,
  //     contextSize: 1024,
  //     batchSize: 1,
  //     gpuLayers: this.selectedModel.modelReqs.GPURequired? -1: 0,
  //     threads: 1,
  //     temperature: 0.9,
  //     topK: 0,
  //     topP: 1,
  //     logitsAll: false,
  //     vocabOnly: false,
  //     useMmap: false,
  //     useMlock: false,
  //     embedding: false,
  //   };
  //   return options;
  // }

  // async getInferenceModel(): Promise<LlamaChatSession> {
  //   return this._loadLocalModel();
  // }

  changemodel(newModel: any){
    /// dereference the current static inference object
    /// set new one
  }

}

