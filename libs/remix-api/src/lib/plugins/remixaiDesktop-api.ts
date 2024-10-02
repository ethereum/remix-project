import { StatusEvents } from "@remixproject/plugin-utils";

export interface IRemixAIDesktop {
  events: {
    onStreamResult(streamText: string): Promise<void>,
  } & StatusEvents,
  methods: {
    code_completion(context: string): Promise<string> 
    code_insertion(msg_pfx: string, msg_sfx: string): Promise<string>,
    code_generation(prompt: string): Promise<string>,
    code_explaining(code: string, context?: string): Promise<string>,
    error_explaining(prompt: string): Promise<string>,
    solidity_answer(prompt: string): Promise<string>,
    initializeModelBackend(local: boolean, generalModel?, completionModel?): Promise<void>,
  }
}