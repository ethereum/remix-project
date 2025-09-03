// create a list of supported models
// create a function getModels returning a list of all supported models
// create a function getModel returning a model by its name

import { IModel, IParams } from './types';
import { ModelType } from './constants';

const DefaultModels = (): IModel[] => {
  const model1:IModel = {
    name: 'DeepSeek',
    task: 'text-generation',
    modelName: 'deepseek-coder-6.7b-instruct-q4.gguf',
    downloadUrl: 'https://drive.usercontent.google.com/download?id=13sz7lnEhpQ6EslABpAKl2HWZdtX3d9Nh&confirm=xxx',
    modelType: ModelType.GENERAL,
    modelReqs: { backend: 'llamacpp', minSysMemory: 8, GPURequired: false, MinGPUVRAM: 8 }
  };
  const model2: IModel = {
    name: 'DeepSeek',
    task: 'text-generation',
    modelName: 'deepseek-coder-1.3b-base-q4.gguf',
    downloadUrl: 'https://drive.usercontent.google.com/download?id=13UNJuB908kP0pWexrT5n8i2LrhFaWo92&confirm=xxx',
    modelType: ModelType.CODE_COMPLETION_INSERTION,
    modelReqs: { backend: 'llamacpp', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };

  const model3: IModel = {
    name: 'llama3.1_8B',
    task: 'text-generation',
    modelName: 'llama3_1_8B-q4_0.gguf',
    downloadUrl: 'https://drive.usercontent.google.com/download?id=1I376pl8uORDnUIjfNuqhExK4NCiH3F12&confirm=xxx',
    modelType: ModelType.GENERAL,
    modelReqs: { backend: 'llamacpp', minSysMemory: 8, GPURequired: false, MinGPUVRAM: 8 }
  };

  const model4: IModel = {
    name: 'llama3.1_8B_instruct',
    task: 'text-generation',
    modelName: 'llama3_1_8B-q4_0_instruct.gguf',
    downloadUrl: 'https://drive.usercontent.google.com/download?id=1P-MEH7cPxaR20v7W1qbOEPBzgiY2RDLx&confirm=xxx',
    modelType: ModelType.GENERAL,
    modelReqs: { backend: 'llamacpp', minSysMemory: 8, GPURequired: false, MinGPUVRAM: 8 }
  };

  return [model1, model2, model3, model4];
}

const getModel = async (name: string): Promise<IModel | undefined> => {
  return DefaultModels().find(model => model.name === name);
}

const loadModel = async (modelname: string): Promise<void> => {
  console.log(`Loading model ${modelname}`);
}

const CompletionParams:IParams = {
  temperature: 0.8,
  topK: 40,
  topP: 0.92,
  max_new_tokens: 15,
  stream_result: false,
  max_tokens: 200,
  version: '1.0.0'
}

const InsertionParams:IParams = {
  temperature: 0.8,
  topK: 40,
  topP: 0.92,
  max_new_tokens: 150,
  stream_result: false,
  stream: false,
  model: "",
  version: '1.0.0',
}

const GenerationParams:IParams = {
  temperature: 0.5,
  topK: 40,
  topP: 0.92,
  max_new_tokens: 20000,
  stream_result: false,
  stream: false,
  model: "",
  repeat_penalty: 1.2,
  terminal_output: false,
  version: '1.0.0',
}

const AssistantParams:IParams = GenerationParams
AssistantParams.provider = 'mistralai' // default provider

export { DefaultModels, CompletionParams, InsertionParams, GenerationParams, AssistantParams }
