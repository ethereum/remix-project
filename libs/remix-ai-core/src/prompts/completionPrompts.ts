import { COMPLETION_SYSTEM_PROMPT } from "../types/constants";
import { IModel } from "../types/types";

export const getInsertionPrompt = (model:IModel, msg_pfx, msg_sfx) => {
  if ((model.modelType === 'code_completion_insertion') && (model.modelName.toLocaleLowerCase().includes('deepseek'))){
    return `'<｜fim▁begin｜>' ${msg_pfx} '<｜fim▁hole｜>' ${msg_sfx} '<｜fim▁end｜>'`
  }
  else {
    // return error model not supported yet

  }
}

export const getCompletionPrompt = (model:IModel, context) => {
  if ((model.modelType === 'code_completion') && (model.modelName.toLocaleLowerCase().includes('deepseek'))){
    return `{COMPLETION_SYSTEM_PROMPT} \n### Instruction:\n{context}\n ### Response: `
  }
}
