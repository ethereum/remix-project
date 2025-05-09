'use strict'

import { IModel, IModelResponse, IModelRequest, InferenceModel, ICompletions,
  IParams, ChatEntry, AIRequestType, IRemoteModel,
  RemoteBackendOPModel, IStreamResponse } from './types/types'
import { ModelType } from './types/constants'
import { DefaultModels, InsertionParams, CompletionParams, GenerationParams, AssistantParams } from './types/models'
import { getCompletionPrompt, getInsertionPrompt } from './prompts/completionPrompts'
import { buildSolgptPrompt, PromptBuilder } from './prompts/promptBuilder'
import { RemoteInferencer } from './inferencers/remote/remoteInference'
import { ChatHistory } from './prompts/chat'
import { downloadLatestReleaseExecutable } from './helpers/inferenceServerReleases'
import { ChatCommandParser } from './helpers/chatCommandParser'
export {
  IModel, IModelResponse, IModelRequest, InferenceModel, ChatCommandParser,
  ModelType, DefaultModels, ICompletions, IParams, IRemoteModel,
  getCompletionPrompt, getInsertionPrompt, IStreamResponse, buildSolgptPrompt,
  RemoteInferencer, InsertionParams, CompletionParams, GenerationParams, AssistantParams,
  ChatEntry, AIRequestType, RemoteBackendOPModel, ChatHistory, downloadLatestReleaseExecutable
}

export * from './types/types'
export * from './helpers/streamHandler'
export * from './agents/codeExplainAgent'
export * from './agents/completionAgent'
export * from './agents/securityAgent'
export * from './agents/contractAgent'
export * from './agents/workspaceAgent'
