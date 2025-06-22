import { RemoteBackendOPModel } from "../types/types"
import { ChatHistory } from "./chat"

export const PromptBuilder = (inst, answr, modelop) => {
  if (modelop === RemoteBackendOPModel.CODELLAMA) return `<|eot_id|>\n<|start_header_id|>user<|end_header_id|>${inst}<|eot_id|>\n<|start_header_id|>assistant<|end_header_id|> ${answr}\n`
  if (modelop === RemoteBackendOPModel.DEEPSEEK) return "\n### INSTRUCTION:\n" + inst + "\n### RESPONSE:\n" + answr
  if (modelop === RemoteBackendOPModel.MISTRAL) return ""
}

export const buildChatPrompt = (userPrompt) => {
  const history = []
  for (const [question, answer] of ChatHistory.getHistory()) {
    if (question.startsWith('sol-gpt')) {
      history.push({ role:'user', content:question.split('sol-gpt')[1] })
      history.push({ role:'assistant' , content: answer })
    }
    else if (question.startsWith('gpt')) {
      history.push({ role:'user', content:question.split('gpt')[1] })
      history.push({ role:'assistant' , content: answer })
    }
    else {
      history.push({ role:'user', content: question })
      history.push({ role:'assistant' , content: answer })
    }
  }
  history.push({ role: 'user', content: userPrompt })
  return history
}
