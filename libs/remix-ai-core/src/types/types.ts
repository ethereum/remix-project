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
  downloadUrl: string;
  modelName?: string;
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
