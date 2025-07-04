import { IParams } from "@remix/remix-ai-core";
import { StatusEvents } from "@remixproject/plugin-utils";

export interface IRemixAID {
  events: {
    activated():void,
    onInference():void,
    onInferenceDone():void,
    onStreamResult(streamText: string):void,

  } & StatusEvents,
  methods: {
    code_completion(prompt: string, context: string, params?): Promise<string>
    code_insertion(msg_pfx: string, msg_sfx: string, params?): Promise<string>,
    code_generation(prompt: string, params?): Promise<string | null>,
    code_explaining(code: string, context?: string, params?): Promise<string | null>,
    error_explaining(prompt: string, context?: string, params?): Promise<string | null>,
    answer(prompt: string, params?): Promise<string | null>,
    initializeModelBackend(local: boolean, generalModel?, completionModel?): Promise<void>,
  }
}
