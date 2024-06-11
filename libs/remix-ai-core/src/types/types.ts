// model implementation for the model selection component

import exp from 'constants';
import { ModelType } from './constants';

export interface Model {
  name: string;
  download_url: string;
  type: ModelType;
  url: string;
}

export interface ModelResponse {
  output: string;
  error: string;
  success: boolean;
  model: Model;
}

export interface ModelRequest {
  input: string;
  model: Model;
}

export interface InferenceModel {
  model: Model;
  location: string;
  isRemote: boolean;
}
