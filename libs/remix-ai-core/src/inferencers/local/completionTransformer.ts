
import { EventEmitter } from 'events';
import path from 'path';
import { ICompletions, IModel, IParams } from '../../types/types';
import { getInsertionPrompt } from '../../prompts/completionPrompts';

const insertionParams:IParams = {
  temperature: 0.9,
  max_new_tokens: 1024,
  return_full_text: false,
  // repetition_penalty: 1.5,
  // num_beams: 1,
  // num_return_sequences: 1,
}

const completionParams:IParams = {
  temperature: 0.3,
  max_new_tokens: 15,
  return_full_text: false,
  top_p: 0.9,
  top_k: 50
}

class InlineCompletionTransformer {
  static task = null
  static model = null
  static instance = null;
  static defaultModels = null

  // getting the instance of the model for the first time will download the model to the cache
  static async getInstance(progress_callback = null, modelCacheDir:string) {
    if (InlineCompletionTransformer.instance === null) {
      const TransformersApi = Function('return import("@xenova/transformers")')();
      const { pipeline, env } = await TransformersApi;

      if (InlineCompletionTransformer.model.modelReqs.backend !== 'transformerjs') {
        console.log('model not supported')
        return
      }

      console.log('loading model', InlineCompletionTransformer.model)
      InlineCompletionTransformer.instance = pipeline(InlineCompletionTransformer.task, InlineCompletionTransformer.model.modelName, { progress_callback, quantized: true, cache_dir: modelCacheDir, return_full_text: false });
    }
    return this.instance;
  }
}

class DownloadManager {
  // eslint-disable-next-line @typescript-eslint/ban-types
  responses: { [key: number]: Function }
  events: EventEmitter
  current: number
  constructor() {
    this.events = new EventEmitter()
    this.responses = {}
    this.current
  }

  onMessageReceived = (e) => {
    switch (e.status) {
    case 'initiate':
      this.events.emit(e.status, e)
      // Model file start load: add a new progress item to the list.
      break;

    case 'progress':
      this.events.emit(e.status, e)
      // Model file progress: update one of the progress items.
      break;

    case 'done':
      this.events.emit(e.status, e)
      // Model file loaded: remove the progress item from the list.
      break;

    case 'ready':
      this.events.emit(e.status, e)
      // Pipeline ready: the worker is ready to accept messages.
      break;

    case 'update':
      this.events.emit(e.status, e)
      // Generation update: update the output text.
      break;

    case 'complete':
      this.events.emit(e.status, e)
      if (this.responses[e.id]) {
        if (this.current === e.id) {
          this.responses[e.id](null, e)
        } else {
          this.responses[e.id]('aborted')
        }
        delete this.responses[e.id]
        this.current = null
      }

      // Generation complete: re-enable the "Generate" button
      break;
    }
  }

}

export class InlineCompletionServiceTransformer implements ICompletions{
  dMng = new DownloadManager()
  isReady = false
  event = new EventEmitter()
  selectedModel: any
  inferencer = null
  modelCacheDir: string = undefined

  constructor(model:IModel, modelDir:string) {
    this.selectedModel = model
    this.modelCacheDir = path.join(modelDir, 'models')

    this.dMng.events.on('progress', (data) => {
      // log progress percentage
      const loaded = ((Number(data.loaded * 100 / data.total)).toFixed(2)).toString()
      console.log('download progress:', loaded + '%')

      if (loaded === '100.00') {
        this.dMng.events.emit('done', data)
        this.isReady = true
      }
    })
    this.dMng.events.on('done', (data) => {
    })
    this.dMng.events.on('ready', (data) => {
      console.log('model ready')
      this.isReady = true
    })
    this.dMng.events.on('complete', (data) => {
    })

  }

  async init() {
    InlineCompletionTransformer.model = this.selectedModel
    InlineCompletionTransformer.task = InlineCompletionTransformer.model.task

    // create inference instance
    this.inferencer = await InlineCompletionTransformer.getInstance(this.dMng.onMessageReceived, this.modelCacheDir);
    console.log('inference instance created', this)
  }

  async code_completion(context: any, params:IParams=completionParams): Promise<any> {
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }
    console.log('in transformer code_completion')

    // as of now no prompt required
    this.event.emit('onInference')
    const result = await this.inferencer(context, params)
    this.event.emit('onInferenceDone')
    console.log('result', result)
    return result
  }

  async code_insertion(msg_pfx: string, msg_sfx: string, params:IParams=insertionParams): Promise<any> {
    console.log('in transformer code_insertion')
    if (!this.isReady) {
      console.log('model not ready yet')
      return
    }

    this.event.emit('onInference')
    const prompt = getInsertionPrompt(InlineCompletionTransformer.model, msg_pfx, msg_sfx)
    console.log('prompt', prompt)
    const result = this.inferencer(prompt, insertionParams)
    this.event.emit('onInferenceDone')
    console.log('result', result)
    return result
  }
}

module.exports = {
  InlineCompletionServiceTransformer
}