import { ICompletions, IGeneration, IParams } from "../../types/types";
import { CompletionParams, GenerationParams } from "../../types/models";
import EventEmitter from "events";
import { ChatHistory } from "../../prompts/chat";
import { isOllamaAvailable } from "./ollama";
import axios from "axios";

const defaultErrorMessage = `Unable to get a response from Ollama server`;

export class OllamaInferencer implements ICompletions {
  api_url: string = "http://localhost:11434/api/chat";
  models_url: string = "http://localhost:11434/api/tags";
  model_name: string = "llama3"; // Default model
  event: EventEmitter;

  constructor(modelName?: string) {
    this.model_name = modelName || this.model_name;
    this.event = new EventEmitter();
  }

  private async _makeRequest(payload: any): Promise<string> {
    this.event.emit("onInference");

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

  private async _streamInferenceRequest(payload: any): Promise<string> {
    this.event.emit("onInference");

    const response = await fetch(this.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let resultText = "";

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
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

  async code_completion(context: any, ctxFiles: any, fileName: any, options: IParams = CompletionParams) {
  }

  async code_insertion(prompt: string, options: IParams = GenerationParams) {
  }

  async code_generation(prompt: string, options: IParams = GenerationParams) {
  }

  async generate(userPrompt: string, options: IParams = GenerationParams): Promise<any> {
  }

  async generateWorkspace(prompt: string, options: IParams = GenerationParams): Promise<any> {
  }

  async solidity_answer(prompt: string, options: IParams = GenerationParams): Promise<any> {
  }

  async code_explaining(prompt: string, options: IParams = GenerationParams): Promise<any> {
  }

  async vulnerability_check(prompt: string, options: IParams = GenerationParams): Promise<any> {
  }


}
