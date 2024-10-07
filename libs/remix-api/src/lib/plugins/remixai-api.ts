import { IModel, IParams, IRemoteModel } from "@remix/remix-ai-core";
import { StatusEvents } from "@remixproject/plugin-utils";

export interface IRemixAI {
  events: {
    onStreamResult(streamText: string): Promise<void>,
    activated(): Promise<void>,
  } & StatusEvents,
  methods: {
    code_completion(context: string): Promise<string> 
    code_insertion(msg_pfx: string, msg_sfx: string): Promise<string>,
    code_generation(prompt: string): Promise<string | null>,
    code_explaining(code: string, context?: string): Promise<string | null>,
    error_explaining(prompt: string): Promise<string | null>,
    solidity_answer(prompt: string): Promise<string | null>,
    initializeModelBackend(local: boolean, generalModel?, completionModel?): Promise<void>,
    chatPipe(pipeMessage: string): Promise<void>,
    ProcessChatRequestBuffer(params:IParams): Promise<void>,
    initialize(model1?:IModel, model2?:IModel, remoteModel?:IRemoteModel, useRemote?:boolean): Promise<void>,
  }
}