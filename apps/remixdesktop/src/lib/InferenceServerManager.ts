import path, { resolve } from 'path';
const { spawn } = require('child_process'); // eslint-disable-line
import fs from 'fs';
import axios from "axios";
import { EventEmitter } from 'events';
import { ICompletions, IModel, IParams, InsertionParams,
  CompletionParams, GenerationParams, ModelType,
  IStreamResponse } from "../../../../libs/remix-ai-core/src/index"

class ServerStatusTimer {
  private intervalId: NodeJS.Timeout | null = null;
  public interval: number;
  private task: () => void;

  constructor(task: () => void, interval: number) {
    this.task = task;
    this.interval = interval;
  }

  start(): void {
    if (this.intervalId === null) {
      this.intervalId = setInterval(() => {
        this.task();
      }, this.interval);
    }
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

export class InferenceManager implements ICompletions {
  isReady: boolean = false
  selectedModels: IModel[] = []
  event: EventEmitter
  modelCacheDir: string = undefined
  isInferencing: boolean = false
  private inferenceProcess: any=null
  port = 5501
  inferenceURL = 'http://127.0.0.1:' + this.port
  private static instance=null
  stateTimer: ServerStatusTimer

  private constructor(modelDir:string) {
    this.event = new EventEmitter()
    this.modelCacheDir = path.join(modelDir, 'models')
    this.stateTimer= new ServerStatusTimer(() => { this._processStatus()}, 20000)
  }

  static getInstance(modelDir:string){
    if (!InferenceManager.instance) {
      // check if ther is a process already running
      if (!modelDir) {
        console.error('model directory is required to create InferenceManager instance')
        return null
      }
      console.log('Creating new InferenceManager instance')
      InferenceManager.instance = new InferenceManager(modelDir)
    }
    return InferenceManager.instance
  }

  // init the backend with a new model
  async init(model:IModel) {
    try {
      await this._downloadModel(model)

      if (model.downloadPath === undefined) {
        console.log('Model not downloaded or not found')
        return
      }

      console.log('Model downloaded at', model.downloadPath)

      if (this.inferenceProcess === null) await this._startServer()

      switch (model.modelType) {
      case ModelType.CODE_COMPLETION_INSERTION || ModelType.CODE_COMPLETION:{
        const res = await this._makeRequest('init_completion', { model_path: model.downloadPath })

        if (res?.data?.status === "success") {
          this.isReady = true
          console.log('Completion Model initialized successfully')
        } else {
          this.isReady = false
          console.error('Error initializing the model', res.data?.error)
        }
        break;
      }

      case ModelType.GENERAL:{
        const res = await this._makeRequest('init', { model_path: model.downloadPath })

        if (res.data?.status === "success") {
          this.isReady = true
          console.log('General Model initialized successfully')
        } else {
          this.isReady = false
          console.error('Error initializing the model', res.data?.error)
        }
        break;
      }
      }

      this.stateTimer.start()
      this.selectedModels.push(model)
    } catch (error) {
      console.error('Error initializing the model', error)
      this.isReady = false
      InferenceManager.instance = null
    }
  }

  async _processStatus() {
    const options = { headers: { 'Content-Type': 'application/json', } }
    const state = await axios.get(this.inferenceURL+"/state", options)

    if (!state.data?.status) {
      console.log('Inference server not running')
      InferenceManager.instance = null
      this.stateTimer.interval += this.stateTimer.interval
      
      if (this.stateTimer.interval >= 60000) {
        // attempt to restart the server
        console.log('Attempting to restart the server')
        this.stopInferenceServer()
        this._startServer()
        this.stateTimer.interval = 20000
      }
    } else {
      // Server is running with successful request
      // console.log('Inference server is running')
      // console.log('completion is runnig', state.data?.completion)
      // console.log('general is runnig', state.data?.general)
    }

  }

  async _downloadModel(model:IModel): Promise<string> {
    if (this.modelCacheDir === undefined) {
      console.log('Model cache directory not provided')
      return
    } else {
      const outputLocationPath = path.join(this.modelCacheDir, model.modelName);
      console.log('output location path is', outputLocationPath)
      if (fs.existsSync(outputLocationPath)) {
        model.downloadPath = outputLocationPath
        console.log('Model already exists in the output location', outputLocationPath);
        return;
      }

      console.log('Downloading model from', model.downloadUrl);
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
      model.downloadPath = outputLocationPath
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
        return reject(new Error(`Inference server not found at ${serverPath}`));
      }

      // Check file permissions
      try {
        fs.accessSync(serverPath, fs.constants.X_OK);
      } catch (err) {
        return reject(new Error(`No execute permission on ${serverPath}`));
      }

      const spawnArgs = [this.port];

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
        console.error(`Inference log: ${data}`);
        if (data.includes('Address already in use')) {
          console.error(`Port ${this.port} is already in use. Please stop the existing server and try again`);
          reject(new Error(`Port ${this.port}  is already in use`));
        }
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

  private async _makeInferenceRequest(endpoint, payload){
    try {
      this.event.emit('onInference')
      const options = { headers: { 'Content-Type': 'application/json', } }
      const response = await axios.post(`${this.inferenceURL}/${endpoint}`, payload, options)
      this.event.emit('onInferenceDone')

      if (response.data?.generatedText) {
        return response.data.generatedText
      } else { return "" }
    } catch (error) {
      console.error('Error making request to Inference server:', error.message);
    }
  }

  private async _streamInferenceRequest(endpoint, payload){
    try {
      this.event.emit('onInference')
      const options = { headers: { 'Content-Type': 'application/json', } }
      const response = await axios({
        method: 'post',
        url: `${this.inferenceURL}/${endpoint}`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        }
        , responseType: 'stream' });

      response.data.on('data', (chunk: Buffer) => {
        try {
          const parsedData = JSON.parse(chunk.toString());
          if (parsedData.isGenerating) {
            this.event.emit('onStreamResult', parsedData.generatedText);
          } else {
            return parsedData.generatedText
          }

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

      return "" // return empty string for now as payload already handled in event
    } catch (error) {
      console.error('Error making stream request to Inference server:', error.message);
    }
    finally {
      this.event.emit('onInferenceDone')
    }
  }

  private async _makeRequest(endpoint, payload){
    try {
      const options = { headers: { 'Content-Type': 'application/json', } }
      const response = await axios.post(`${this.inferenceURL}/${endpoint}`, payload, options)
      this.event.emit('onInferenceDone')

      return response
    } catch (error) {
      console.error('Error making request to Inference server:', error.message);
    }
  }

  async code_completion(context: any, params:IParams=CompletionParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }

    // as of now no prompt required
    const payload = { context_code: context, ...params }
    return this._makeInferenceRequest('code_completion', payload)
  }

  async code_insertion(msg_pfx: string, msg_sfx: string, params:IParams=InsertionParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }
    const payload = { code_pfx:msg_pfx, code_sfx:msg_sfx, ...params }
    return this._makeInferenceRequest('code_insertion', payload)

  }

  async code_generation(prompt: string, params:IParams=GenerationParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }
    return this._makeInferenceRequest('code_generation', { prompt, ...params })
  }

  async code_explaining(code:string, context:string, params:IParams=GenerationParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }
    if (GenerationParams.stream_result) {
      return this._streamInferenceRequest('code_explaining', { code, context, ...params })
    } else {
      return this._makeInferenceRequest('code_explaining', { code, context, ...params })
    }
  }

  async error_explaining(prompt: string, params:IParams=GenerationParams): Promise<any>{
    if (!this.isReady) {
      console.log('model not ready yet')
      return ""
    }
    if (GenerationParams.stream_result) {
      return this._streamInferenceRequest('error_explaining', { prompt, ...params })
    } else {
      return this._makeInferenceRequest('error_explaining', { prompt, ...params })
    }
  }

  async solidity_answer(prompt: string, params:IParams=GenerationParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }
    if (GenerationParams.stream_result) {
      return this._streamInferenceRequest('solidity_answer', { prompt, ...params })
    } else {
      return this._makeInferenceRequest('solidity_answer', { prompt, ...params })
    }
  }

  // kill dangling process making use of the port

}