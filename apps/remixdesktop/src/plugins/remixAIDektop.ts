import { ElectronBasePlugin, ElectronBasePluginClient } from "@remixproject/plugin-electron"
import { Profile } from "@remixproject/plugin-utils"
import { app } from 'electron';
// import { Model, ModelType, DefaultModels } from '@remix/remix-ai-core';
import axios from "axios";
import fs from 'fs';
import path from 'path';
import {LlamaModel, LlamaContext, LlamaChatSession, LlamaModelOptions} from "node-llama-cpp";

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
  methods: ['downloadModel']
}

class RemixAIDesktopPluginClient extends ElectronBasePluginClient {
  SelectedModelPath: any
  selectedModel: any

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
  async listAvailableModels(){

  }

  async enable (){
    console.log('Remix AI desktop plugin enabled')
    this.emit('enabled')
  }


  
  async downloadModel(model): Promise<void> {
    console.log('Downloading the model model', model)
    console.log('Downloading model', model.downloadUrl) 

    const wdir = await this.call('fs' as any, 'getWorkingDir');
    console.log('working dir is', wdir)
    const outputLocationDir = await this.call('fs' as any, 'selectFolder', wdir);
    console.log('output location dir is', outputLocationDir)

    if (outputLocationDir === undefined) {
      console.log('No output location selected');
      return;
    }

    const outputLocationPath = path.join(outputLocationDir, model.modelName);
    console.log('output location path is', outputLocationDir)
    if (fs.existsSync(outputLocationPath)) { 
      console.log('Model already exists in the output location', outputLocationPath);
      this.SelectedModelPath = outputLocationPath;
      this.selectedModel = model;
      return;
    }

    // Make a HEAD request to get the file size
    const { headers } = await axios.head(model.downloadUrl);
    const totalSize = parseInt(headers['content-length'], 10);

    // Create a write stream to save the file
    const writer = fs.createWriteStream(outputLocationPath);

    // Start the file download
    const response = await axios({
      method: 'get',
      url: model.downloadUrl,
      responseType: 'stream'
    });

    let downloadedSize = 0;

    response.data.on('data', (chunk: Buffer) => {
      downloadedSize += chunk.length;
      const progress = (downloadedSize / totalSize) * 100;
      console.log(`Downloaded ${progress}%`);
      this.emit('download_progress', progress);
    });

    response.data.pipe(writer);
    this.SelectedModelPath = outputLocationPath;
    this.selectedModel = model;

    console.log('Download complete');
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async loadLocalModel(): Promise<LlamaChatSession> {
    if (!this.SelectedModelPath) {
      console.log('No model selected yet');
      return;
    }
    console.log('Loading model at ', this.SelectedModelPath);
    const model = new LlamaModel(this.SelectedModelPath);

    const context = new LlamaContext({model});
    const session = new LlamaChatSession({context});

    return session;
  }
  
  _getModelOptions(): LlamaModelOptions {
    
    const options: LlamaModelOptions = {
      modelPath: this.SelectedModelPath,
      contextSize: 1024,
      batchSize: 1,
      gpuLayers: 0,
      threads: 1,
      temperature: 0.9,
      topK: 0,
      topP: 1,
      logitsAll: false,
      vocabOnly: false,
      useMmap: false,
      useMlock: false,
      embedding: false,
    };
    return options;
  }

}

