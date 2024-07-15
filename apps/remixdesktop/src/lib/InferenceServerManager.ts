import path from 'path';
const { spawn } = require('child_process'); // eslint-disable-line
import fs from 'fs';
import axios from "axios";
import { EventEmitter } from 'events';
import { ICompletions, IModel, IParams } from "@remix/remix-ai-core";
import { getInsertionPrompt } from "@remix/remix-ai-core";

const completionParams:IParams = {
  temperature: 0.8,
  topK: 40,
  topP: 0.92,
  max_new_tokens: 15,
}

const insertionParams:IParams = {
  temperature: 0.8,
  topK: 40,
  topP: 0.92,
  max_new_tokens: 150,
}

export class InferenceManager implements ICompletions {
  isReady: boolean = false
  selectedModel: any
  modelPath: string
  event: EventEmitter
  modelCacheDir: string = undefined
  isInferencing: boolean = false
  inferenceProcess: any=null
  inferenceURL = 'http://127.0.0.1:5501'
  static instance=null

  private constructor(model:IModel, modelDir:string) {
    this.selectedModel = model
    this.event = new EventEmitter()
    this.modelCacheDir = path.join(modelDir, 'models')
  }

  static getInstance(model:IModel, modelDir:string){
    if (!InferenceManager.instance) {
      // check if ther is a process already running
      if (!model || !modelDir) {
        console.error('Model and model directory is required to create InferenceManager instance')
        return null
      }
      console.log('Creating new InferenceManager instance')
      InferenceManager.instance = new InferenceManager(model, modelDir)
    }
    return InferenceManager.instance
  }

  async init() {
    try {
      await this._downloadModel(this.selectedModel)

      if (this.modelPath === undefined) {
        console.log('Model not downloaded or not found')
        return
      }

      console.log('Model downloaded at', this.modelPath)

      this._startServer()

      this.isReady = true
    } catch (error) {
      console.error('Error initializing the model', error)
      this.isReady = false
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

  getPythonScriptPath() {
    return path.join(process.cwd(), 'dist', 'InferenceServer');
  }

  private _startServer() {
    return new Promise<void>((resolve, reject) => {
      const serverPath = this.getPythonScriptPath();

      // Check if the file exists
      if (!fs.existsSync(serverPath)) {
        return reject(new Error(`Python script not found at ${serverPath}`));
      }

      // Check file permissions
      try {
        fs.accessSync(serverPath, fs.constants.X_OK);
      } catch (err) {
        return reject(new Error(`No execute permission on ${serverPath}`));
      }

      console.log('Running in non-pkg environment');
      const spawnArgs = ['5501', this.modelPath];

      console.log(`Spawning process: ${serverPath} ${spawnArgs.join(' ')}`);
      this.inferenceProcess = spawn(serverPath, spawnArgs);

      this.inferenceProcess.stdout.on('data', (data) => {
        console.log(`Inference server output: ${data}`);
        if (data.includes('Running on http://')) {
          console.log('Inference server started successfully');
          resolve();
        }
      });

      this.inferenceProcess.stderr.on('data', (data) => {
        console.error(`Inference server: ${data}`);
        resolve();
      });

      this.inferenceProcess.on('error', (err) => {
        console.error('Failed to start Inference server:', err);
        reject(err);
      });

      this.inferenceProcess.on('close', (code) => {
        console.log(`Inference server process exited with code ${code}`);
        if (code !== 0) {
          reject(new Error(`Inference server exited with code ${code}`));
        }
      });
    });
  }

  stopInferenceServer() {
    if (this.inferenceProcess) {
      this.inferenceProcess.kill();
      this.inferenceProcess = null;
    }
  }

  private async _makeRequest(endpoint, payload){
    try {
      this.event.emit('onInference')
      const options = { headers: { 'Content-Type': 'application/json', } }
      const response = await axios.post(`${this.inferenceURL}/${endpoint}`, payload, options)
      this.event.emit('onInferenceDone')

      if (response?.data?.generatedText) {
        return response.data.generatedText
      } else { return "" }
    } catch (error) {
      console.error('Error making request to Inference server:', error.message);
    }
  }

  async code_completion(context: any, params:IParams=completionParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }

    // as of now no prompt required
    const payload = { context_code: context, ...params }
    return this._makeRequest('code_completion', payload)
  }

  async code_insertion(msg_pfx: string, msg_sfx: string, params:IParams=insertionParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }
    const payload = { code_pfx:msg_pfx, code_sfx:msg_sfx, ...params }
    return this._makeRequest('code_insertion', payload)

  }

}