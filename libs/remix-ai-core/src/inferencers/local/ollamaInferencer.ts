import { AIRequestType, ICompletions, IGeneration, IParams } from "../../types/types";
import { CompletionParams, GenerationParams } from "../../types/models";
import EventEmitter from "events";
import { ChatHistory } from "../../prompts/chat";
import { isOllamaAvailable } from "./ollama";
import axios from "axios";
import { RemoteInferencer } from "../remote/remoteInference";

const defaultErrorMessage = `Unable to get a response from Ollama server`;

export class OllamaInferencer extends RemoteInferencer implements ICompletions {
  ollama_api_url: string = "http://localhost:11434/api/generate";
  model_name: string = "llama2:13b"; // Default model

  constructor(modelName?: string) {
    super();
    this.api_url = this.ollama_api_url;
    this.model_name = modelName || this.model_name;
  }

  override async _makeRequest(payload: any, rType:AIRequestType): Promise<string> {
    this.event.emit("onInference");
    payload['stream'] = false;
    payload['model'] = this.model_name;
    console.log("calling _makeRequest Ollama API URL:", this.api_url);
    try {
      const result = await axios.post(this.api_url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (result.status === 200) {
        const text = result.data.message?.content || "";
        return text;
      } else {
        return defaultErrorMessage;
      }
    } catch (e: any) {
      console.error("Error making Ollama request:", e.message);
      return defaultErrorMessage;
    } finally {
      this.event.emit("onInferenceDone");
    }
  }

  override async _streamInferenceRequest(payload: any, rType:AIRequestType) {
    this.event.emit("onInference");
    payload['model'] = this.model_name;
    console.log("payload in stream request", payload);
    console.log("calling _streammakeRequest Ollama API URL:", this.api_url);

    const response = await fetch(this.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stream: true,
        model: this.model_name,
        messages: [{ role: "user", content: payload.prompt }],
      }),
    });

    console.log("response in stream request", response);
    // if (payload.return_stream_response) {
    //   return response
    // }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let resultText = "";

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log("chunk", chunk);
        resultText += chunk;
        this.event.emit("onStreamResult", chunk);
      }
      return resultText;
    } catch (e: any) {
      console.error("Streaming error from Ollama:", e.message);
      return defaultErrorMessage;
    } finally {
      this.event.emit("onInferenceDone");
    }
  }

  private _buildPayload(prompt: string, system?: string) {
    return {
      model: this.model_name,
      system: system || "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    };
  }

  // async code_completion(context: any, ctxFiles: any, fileName: any, options: IParams = CompletionParams) {
  // }

  // async code_insertion(prompt: string, options: IParams = GenerationParams) {
  // }

  // async code_generation(prompt: string, options: IParams = GenerationParams) {
  // }

  // async generate(userPrompt: string, options: IParams = GenerationParams): Promise<any> {
  // }

  // async generateWorkspace(prompt: string, options: IParams = GenerationParams): Promise<any> {
  // }

  // async answer(prompt: string, options: IParams = GenerationParams): Promise<any> {
  // }

  // async code_explaining(prompt, context:string="", options:IParams=GenerationParams): Promise<any> {
  // }

  // async error_explaining(prompt, options:IParams=GenerationParams): Promise<any> {

  // }

  // async vulnerability_check(prompt: string, options: IParams = GenerationParams): Promise<any> {
  // }
}
