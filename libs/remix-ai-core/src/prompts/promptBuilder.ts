import { RemoteBackendOPModel } from "../types/types"

export const PromptBuilder = (inst, answr, modelop) => {
  if (modelop === RemoteBackendOPModel.CODELLAMA) return ""
  if (modelop === RemoteBackendOPModel.DEEPSEEK) return "\n### INSTRUCTION:\n" + inst + "\n### RESPONSE:\n" + answr
  if (modelop === RemoteBackendOPModel.MISTRAL) return ""
}