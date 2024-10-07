// model implementation for the model selection component

import exp from 'constants';
import { ModelType } from './constants';

export interface IModelRequirements{
  backend: string,
  minSysMemory: number,
  GPURequired: boolean,
  MinGPUVRAM: number,
}

export interface IModel {
  name: string;
  task: string;
  downloadUrl: string;
  modelName: string;
  modelType: ModelType;
  modelReqs: IModelRequirements;
  downloadPath?: string;
  modelOP?: RemoteBackendOPModel;

}
export interface IRemoteModel {
  completionUrl: string;
  apiUrl: string;
}

export interface IModelResponse {
  output: string;
  error: string;
  success: boolean;
  model: IModel;
}

export interface IStreamResponse {
  generatedText: string;
  isGenerating: boolean;
}

export interface IModelRequest {
  input: string;
  model: IModel;
}

export interface InferenceModel {
  model: IModel;
  location: string;
  isRemote: boolean;
}

export interface ICompletions{
  code_completion(context, params:IParams): Promise<any>;
  code_insertion(msg_pfx, msg_sfx, params:IParams): Promise<any>;
}

export interface IParams {
  temperature?: number;
  max_new_tokens?: number;
  repetition_penalty?: number;
  repeatPenalty?:any
  no_repeat_ngram_size?: number;
  num_beams?: number;
  num_return_sequences?: number;
  top_k?: number;
  top_p?: number;
  stream_result?: boolean;
  return_full_text?: boolean;
  nThreads?: number;
  nTokPredict?: number;
  topK?: number;
  topP?: number;
  temp?: number;
}

export enum AIRequestType {
  COMPLETION,
  GENERAL
}

export type ChatEntry = [string, string];

export enum RemoteBackendOPModel{
  DEEPSEEK,
  CODELLAMA,
  MISTRAL
}
