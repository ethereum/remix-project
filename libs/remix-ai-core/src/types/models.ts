// create a list of supported models
// create a function getModels returning a list of all supported models
// create a function getModel returning a model by its name

import { IModel } from './types';
import { ModelType } from './constants';

const DefaultModels = (): IModel[] => {
  const model1:IModel = {
    name: 'DeepSeek',
    task: 'text-generation',
    modelName: 'deepseek-coder-1.3b-instruct.gguf',
    downloadUrl: 'https://huggingface.co/TheBloke/deepseek-coder-1.3b-instruct-GGUF/resolve/main/deepseek-coder-1.3b-instruct.Q4_K_M.gguf?download=true',
    modelType: ModelType.CODE_COMPLETION,
    modelReqs: { backend: 'llamacpp', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };
  const model2: IModel = {
    name: 'DeepSeek',
    task: 'text-generation',
    modelName: 'deepseek-coder-6.7b-instruct.gguf',
    downloadUrl: 'https://huggingface.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF/resolve/main/deepseek-coder-6.7b-instruct.Q4_K_M.gguf?download=true',
    modelType: ModelType.GENERAL,
    modelReqs: { backend: 'llamacpp', minSysMemory: 8, GPURequired: true, MinGPUVRAM: 8 }
  };
  const model3: IModel = {
    name: 'DeepSeekTransformer',
    task: 'text-generation',
    modelName: 'Xenova/deepseek-coder-1.3b-base',
    downloadUrl: 'Xenova/deepseek-coder-1.3b-base',
    modelType: ModelType.CODE_COMPLETION_INSERTION,
    modelReqs: { backend: 'transformerjs', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };
  const model4: IModel = {
    name: 'DeepSeek',
    task: 'text-generation',
    modelName: 'deepseek-coder-1.3b-base.gguf',
    downloadUrl: 'https://huggingface.co/TheBloke/deepseek-coder-1.3b-base-GGUF/resolve/main/deepseek-coder-1.3b-base.Q4_K_M.gguf?download=true',
    modelType: ModelType.CODE_COMPLETION_INSERTION,
    modelReqs: { backend: 'llamacpp', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };
  return [model1, model2, model3, model4];
}

const getModel = async (name: string): Promise<IModel | undefined> => {
  return DefaultModels().find(model => model.name === name);
}

const loadModel = async (modelname: string): Promise<void> => {
  console.log(`Loading model ${modelname}`);
}

export { DefaultModels }