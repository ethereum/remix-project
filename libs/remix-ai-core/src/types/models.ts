// create a list of supported models 
// create a function getModels returning a list of all supported models
// create a function getModel returning a model by its name

import { Model } from './types';

const supportedModels: Model[] = [];


const getModels = async (): Promise<Model[]> => {
  return supportedModels;
}

const getModel = async (name: string): Promise<Model | undefined> => {
  return supportedModels.find(model => model.name === name);
}

const loadModel = async (modelname: string): Promise<void> => {
  console.log(`Loading model ${modelname}`);
}