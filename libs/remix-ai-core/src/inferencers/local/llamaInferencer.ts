import path from 'path';
import fs from 'fs';
import axios from "axios";
import { EventEmitter } from 'events';
import { ICompletions, IModel, IParams } from '../../types/types';
import { getInsertionPrompt } from '../../prompts/completionPrompts';

class LLamaBackend {
  static instance: any
  static model: any
  static modelPath: string

  static async getInstance() {
    if (this.instance === null || this.instance === undefined) {
      const LlamaApi = Function('return import("node-llama-cpp")')();
      const { LlamaModel, LlamaContext, LlamaChatSession, LlamaModelOptions } = await LlamaApi;

      const getModelOptions = () => {
        const options = {
          modelPath: this.modelPath? this.modelPath: null,
          threads: 1,
          temperature: 0.6,
          topK: 40,
          topP: 0.92,
          logitsAll: false,
          vocabOnly: false,
          useMmap: false,
          useMlock: false,
          embedding: false,
        };
        return options;
      }
		  console.log('loading model with options', getModelOptions())
		  const m = new LlamaModel(getModelOptions());

		  console.log("system infos\n", LlamaModel.systemInfo)
		  const context = new LlamaContext({ model: m });
		  const session = new LlamaChatSession({ context });
		  this.instance = session
		  return this.instance
	  }
	  return this.instance
  }
}

export class LLamaInferencer implements ICompletions {
  isReady: boolean = false
  selectedModel: any
  modelPath: string
  event: EventEmitter
  inferencer: any
  modelCacheDir: string = undefined

  constructor(model:IModel, modelDir:string) {
    this.selectedModel = model
    this.event = new EventEmitter()
    this.modelCacheDir = path.join(modelDir, 'models')
  }

  async init() {
    try {
      await this._downloadModel(this.selectedModel)

      if (this.modelPath === undefined) {
        console.log('Model not downloaded or not found')
        return
      }

      console.log('Model downloaded at', this.modelPath)

      LLamaBackend.model = this.selectedModel
      LLamaBackend.modelPath = this.modelPath
      this.inferencer = await LLamaBackend.getInstance()
      this.inferencer.init()
      this.isReady = this.inferencer.initialized
    } catch (error) {
      console.log('Error initializing the model', error)
    }
  }

  async _downloadModel(model): Promise<void> {

    if (this.modelCacheDir === undefined) {
      console.log('Model cache directory not provided')
      return
    } else {
      const outputLocationPath = path.join(this.modelCacheDir, model.modelName);
      console.log('output location path is', outputLocationPath)
      if (fs.existsSync(outputLocationPath)) {
        this.modelPath = outputLocationPath
        console.log('Model already exists in the output location', outputLocationPath);
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
        const progress = (Number((downloadedSize / totalSize) * 100).toFixed(2));
        console.log(`Downloaded ${progress}%`);
        this.event.emit('download', progress);
      });

      response.data.pipe(writer);

      this.event.emit('ready')
      this.modelPath = outputLocationPath
      console.log('LLama Download complete');

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    }
  }

  async code_completion(context: any, params?:IParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }

    // as of now no prompt required
    this.event.emit('onInference')
    const result = params? this.inferencer.prompt(context, params): this.inferencer.prompt(context)
    this.event.emit('onInferenceDone')
    console.log('result', await result)
    return result
  }

  async code_insertion(msg_pfx: string, msg_sfx: string, params?:IParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }
    this.event.emit('onInference')
    const prompt = getInsertionPrompt(this.selectedModel, msg_pfx, msg_sfx)
    const result = params? this.inferencer.prompt(prompt, params): this.inferencer.prompt(prompt)
    this.event.emit('onInferenceDone')
    return result
  }
}