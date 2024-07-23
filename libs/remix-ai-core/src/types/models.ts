// create a list of supported models
// create a function getModels returning a list of all supported models
// create a function getModel returning a model by its name

import { IModel, IParams, RemoteBackendOPModel } from './types';
import { ModelType } from './constants';


const DefaultModels = (): IModel[] => {
  const model1:IModel = {
    name: 'DeepSeek',
    modelOP: RemoteBackendOPModel.DEEPSEEK,
    task: 'text-generation',
    modelName: 'deepseek-coder-1.3b-instruct.gguf',
    downloadUrl: 'https://huggingface.co/TheBloke/deepseek-coder-1.3b-instruct-GGUF/resolve/main/deepseek-coder-1.3b-instruct.Q4_K_M.gguf?download=true',
    modelType: ModelType.CODE_COMPLETION,
    modelReqs: { backend: 'llamacpp', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };
  const model2: IModel = {
    name: 'DeepSeek',
    modelOP: RemoteBackendOPModel.DEEPSEEK,
    task: 'text-generation',
    modelName: 'deepseek-coder-6.7b-instruct.gguf',
    downloadUrl: 'https://huggingface.co/TheBloke/deepseek-coder-6.7B-instruct-GGUF/resolve/main/deepseek-coder-6.7b-instruct.Q4_K_M.gguf?download=true',
    modelType: ModelType.GENERAL,
    modelReqs: { backend: 'llamacpp', minSysMemory: 8, GPURequired: true, MinGPUVRAM: 8 }
  };
  const model3: IModel = {
    name: 'DeepSeekTransformer',
    modelOP: RemoteBackendOPModel.DEEPSEEK,
    task: 'text-generation',
    modelName: 'Xenova/deepseek-coder-1.3b-base',
    downloadUrl: 'Xenova/deepseek-coder-1.3b-base',
    modelType: ModelType.CODE_COMPLETION_INSERTION,
    modelReqs: { backend: 'transformerjs', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };
  const model4: IModel = {
    name: 'DeepSeek',
    modelOP: RemoteBackendOPModel.DEEPSEEK,
    task: 'text-generation',
    modelName: 'deepseek-coder-1.3b-base.gguf',
    downloadUrl: 'https://huggingface.co/TheBloke/deepseek-coder-1.3b-base-GGUF/resolve/main/deepseek-coder-1.3b-base.Q4_K_M.gguf?download=true',
    modelType: ModelType.CODE_COMPLETION_INSERTION,
    modelReqs: { backend: 'llamacpp', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };

  const model5: IModel = {
    name: 'DeepSeek',
    modelOP: RemoteBackendOPModel.DEEPSEEK,
    task: 'text-generation',
    modelName: 'deepseek-coder-6.7B-base-GGUF',
    downloadUrl: 'https://huggingface.co/TheBloke/deepseek-coder-6.7B-base-GGUF/resolve/main/deepseek-coder-6.7b-base.Q4_K_M.gguf?download=true',
    modelType: ModelType.CODE_COMPLETION_INSERTION,
    modelReqs: { backend: 'llamacpp', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 2 }
  };

  const model6: IModel = {
    name: 'DeepSeek',
    modelOP: RemoteBackendOPModel.DEEPSEEK,
    task: 'text-generation',
    modelName: 'DeepSeek-Coder-V2-Lite-Base.Q2_K.gguf',
    downloadUrl: 'https://huggingface.co/QuantFactory/DeepSeek-Coder-V2-Lite-Base-GGUF/resolve/main/DeepSeek-Coder-V2-Lite-Base.Q2_K.gguf?download=true',
    modelType: ModelType.GENERAL,
    modelReqs: { backend: 'llamacpp', minSysMemory: 2, GPURequired: false, MinGPUVRAM: 8 }
  };

  return [model1, model2, model3, model4, model5, model6];
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
}

const InsertionParams:IParams = {
  temperature: 0.8,
  topK: 40,
  topP: 0.92,
  max_new_tokens: 150,
}

const GenerationParams:IParams = {
  temperature: 0.5,
  topK: 40,
  topP: 0.92,
  max_new_tokens: 2000,
  stream_result: false,
}

export { DefaultModels, CompletionParams, InsertionParams, GenerationParams }