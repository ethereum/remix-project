import { RemoteBackendOPModel } from "../types/types"
import { ChatHistory } from "./chat"

export const PromptBuilder = (inst, answr, modelop) => {
  if (modelop === RemoteBackendOPModel.CODELLAMA) return ""
  if (modelop === RemoteBackendOPModel.DEEPSEEK) return "\n### INSTRUCTION:\n" + inst + "\n### RESPONSE:\n" + answr
  if (modelop === RemoteBackendOPModel.MISTRAL) return ""
}

export const buildSolgptPromt = (userPrompt:string, modelOP:RemoteBackendOPModel) => {
  if (modelOP === undefined) {
    console.log('WARNING: modelOP is undefined. Provide a valide model OP for chat history')
    return userPrompt
  }
  if (ChatHistory.getHistory().length === 0){
    return userPrompt
  } else {
    let newPrompt = ""
    for (const [question, answer] of ChatHistory.getHistory()) {
      if (question.startsWith('sol-gpt')) newPrompt += PromptBuilder(question.split('sol-gpt')[1], answer, modelOP)
      else if (question.startsWith('gpt')) newPrompt += PromptBuilder(question.split('gpt')[1], answer, modelOP)
      else newPrompt += PromptBuilder(question, answer, modelOP)
    }
    // finaly
    newPrompt = "sol-gpt " + newPrompt + PromptBuilder(userPrompt.split('sol-gpt')[1], "", modelOP)
    return newPrompt
  }
}