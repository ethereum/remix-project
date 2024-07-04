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
}

export interface IModelResponse {
  output: string;
  error: string;
  success: boolean;
  model: IModel;
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
  no_repeat_ngram_size?: number;
  num_beams?: number;
  num_return_sequences?: number;
}
