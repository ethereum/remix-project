import { AIRequestType, ICompletions, IGeneration, IParams } from "../../types/types";
import { CompletionParams, GenerationParams } from "../../types/models";
import { discoverOllamaHost, listModels } from "./ollama";
import { HandleOllamaResponse } from "../../helpers/streamHandler";
import {
  CONTRACT_PROMPT,
  WORKSPACE_PROMPT,
  CHAT_PROMPT,
  CODE_COMPLETION_PROMPT,
  CODE_INSERTION_PROMPT,
  CODE_GENERATION_PROMPT,
  CODE_EXPLANATION_PROMPT,
  ERROR_EXPLANATION_PROMPT,
  SECURITY_ANALYSIS_PROMPT
} from "./systemPrompts";
import axios from "axios";
import { RemoteInferencer } from "../remote/remoteInference";

const defaultErrorMessage = `Unable to get a response from Ollama server`;

export class OllamaInferencer extends RemoteInferencer implements ICompletions, IGeneration {
  private ollama_host: string | null = null;
  model_name: string = "llama2:13b"; // Default model
  private isInitialized: boolean = false;

  constructor(modelName?: string) {
    super();
    this.model_name = modelName || this.model_name;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.ollama_host = await discoverOllamaHost();
    if (!this.ollama_host) {
      throw new Error('Ollama is not available on any of the default ports');
    }

    // Default to generate endpoint, will be overridden per request type
    this.api_url = `${this.ollama_host}/api/generate`;
    this.isInitialized = true;

    try {
      const availableModels = await listModels();
      if (availableModels.length > 0 && !availableModels.includes(this.model_name)) {
        this.model_name = availableModels[0];
        console.log(`Auto-selected model: ${this.model_name}`);
      }
    } catch (error) {
      console.warn('Could not auto-select model. Make sure you have at least one model installed:', error);
    }
  }

  private getEndpointForRequestType(rType: AIRequestType): string {
    switch (rType) {
    case AIRequestType.COMPLETION:
      return `${this.ollama_host}/api/generate`;
    case AIRequestType.GENERAL:
      return `${this.ollama_host}/api/chat`;
    default:
      return `${this.ollama_host}/api/generate`;
    }
  }

  private buildOllamaOptions(payload: any) {
    const options: any = {};

    if (payload.max_tokens || payload.max_new_tokens) options.num_predict = payload.max_tokens || payload.max_new_tokens;

    if (payload.stop) options.stop = Array.isArray(payload.stop) ? payload.stop : [payload.stop];

    if (payload.temperature !== undefined) options.temperature = payload.temperature;
    if (payload.top_p !== undefined) options.top_p = payload.top_p;

    if (payload.top_k !== undefined) options.top_k = payload.top_k;

    if (payload.repeat_penalty !== undefined) options.repeat_penalty = payload.repeat_penalty;

    if (payload.seed !== undefined) options.seed = payload.seed;
    return Object.keys(options).length > 0 ? options : undefined;
  }

  override async _makeRequest(payload: any, rType: AIRequestType): Promise<string> {
    this.event.emit("onInference");

    const endpoint = this.getEndpointForRequestType(rType);
    const options = this.buildOllamaOptions(payload);
    let requestPayload: any;

    if (rType === AIRequestType.COMPLETION) {
      // Use /api/generate for completion requests
      requestPayload = {
        model: this.model_name,
        prompt: payload.prompt || payload.messages?.[0]?.content || "",
        stream: false,
        system: payload.system || CODE_COMPLETION_PROMPT
      };
      if (options) requestPayload.options = options;
    } else {
      // Use /api/chat for general requests
      requestPayload = {
        model: this.model_name,
        messages: payload.messages || [{ role: "user", content: payload.prompt || "" }],
        stream: false,
        system: payload.system
      };
      if (options) requestPayload.options = options;
    }

    try {
      const result = await axios.post(endpoint, requestPayload, {
        headers: { "Content-Type": "application/json" },
      });

      if (result.status === 200) {
        let text = "";
        if (rType === AIRequestType.COMPLETION) {
          text = result.data.response || "";
        } else {
          text = result.data.message?.content || "";
        }
        return text;
      } else {
        return defaultErrorMessage;
      }
    } catch (e: any) {
      return defaultErrorMessage;
    } finally {
      this.event.emit("onInferenceDone");
    }
  }

  override async _streamInferenceRequest(payload: any, rType: AIRequestType) {
    this.event.emit("onInference");

    const endpoint = this.getEndpointForRequestType(rType);
    const options = this.buildOllamaOptions(payload);
    let streamPayload: any;

    if (rType === AIRequestType.COMPLETION) {
      // Use /api/generate for completion requests
      streamPayload = {
        model: this.model_name,
        prompt: payload.prompt || payload.messages?.[0]?.content || "",
        stream: true,
        system: payload.system || CODE_COMPLETION_PROMPT
      };
      if (options) {
        streamPayload.options = options;
      }
    } else {
      // Use /api/chat for general requests
      streamPayload = {
        model: this.model_name,
        messages: payload.messages || [{ role: "user", content: payload.prompt || "" }],
        stream: true,
        system: payload.system
      };
      if (options) {
        streamPayload.options = options;
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(streamPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      if (payload.return_stream_response) {
        return response
      }

      // Use the centralized Ollama stream handler
      let resultText = "";
      await HandleOllamaResponse(
        response,
        (chunk: string) => {
          resultText += chunk;
          this.event.emit("onStreamResult", chunk);
        },
        (finalText: string) => {
          resultText = finalText;
        }
      );

      return resultText;
    } catch (e: any) {
      return defaultErrorMessage;
    } finally {
      this.event.emit("onInferenceDone");
    }
  }

  private _buildPayload(prompt: string, payload: any, system?: string) {
    return {
      model: this.model_name,
      system: system || CHAT_PROMPT,
      messages: [{ role: "user", content: prompt }],
      ...payload
    };
  }

  async buildCompletionPrompt(prfx:string, srfx:string) {
    const prompt = prfx + '<CURSOR>' + srfx;
    return `Complete the code at the <CURSOR> position. Provide only the code that should be inserted at the cursor position, without any explanations or markdown formatting:\n\n${prompt}`;
  }

  async code_completion(prompt: string, promptAfter: string, ctxFiles: any, fileName: any, options: IParams = CompletionParams): Promise<any> {
    console.log("Code completion called")
    // const contextText = Array.isArray(ctxFiles) ? ctxFiles.map(f => f.content).join('\n') : '';

    // let completionPrompt = `Complete the following code:\n\nFile: ${fileName}\n`;

    // if (contextText) {
    //   completionPrompt += `Context:\n${contextText}\n\n`;
    // }

    // completionPrompt += `Code before cursor (prefix):\n${prompt}\n`;

    // if (promptAfter && promptAfter.trim()) {
    //   completionPrompt += `\nCode after cursor (suffix):\n${promptAfter}\n`;
    //   completionPrompt += `\nComplete the missing code between the prefix and suffix:`;
    // } else {
    //   completionPrompt += `\nComplete the code that should come next:`;
    // }
    const completionPrompt = await this.buildCompletionPrompt(prompt, promptAfter)
    const payload = this._buildPayload(completionPrompt, options, CODE_COMPLETION_PROMPT);
    return await this._makeRequest(payload, AIRequestType.COMPLETION);
  }

  async code_insertion(msg_pfx: string, msg_sfx: string, ctxFiles: any, fileName: any, options: IParams = GenerationParams): Promise<any> {
    console.log("Code insertion called")
    const contextText = Array.isArray(ctxFiles) ? ctxFiles.map(f => f.content).join('\n') : '';
    const prompt = `Fill in the missing code between the prefix and suffix:\n\nFile: ${fileName}\nContext:\n${contextText}\n\nPrefix:\n${msg_pfx}\n\nSuffix:\n${msg_sfx}\n\nComplete the missing code:`;

    const payload = this._buildPayload(prompt, options, CODE_INSERTION_PROMPT);
    return await this._makeRequest(payload, AIRequestType.COMPLETION);
  }

  async code_generation(prompt: string, options: IParams = GenerationParams): Promise<any> {
    const payload = this._buildPayload(prompt, options, CODE_GENERATION_PROMPT);
    if (options.stream_result) {
      return await this._streamInferenceRequest(payload, AIRequestType.GENERAL);
    } else {
      return await this._makeRequest(payload, AIRequestType.GENERAL);
    }
  }

  async generate(userPrompt: string, options: IParams = GenerationParams): Promise<any> {
    const payload = this._buildPayload(userPrompt, options, CONTRACT_PROMPT);
    if (options.stream_result) {
      return await this._streamInferenceRequest(payload, AIRequestType.GENERAL);
    } else {
      return await this._makeRequest(payload, AIRequestType.GENERAL);
    }
  }

  async generateWorkspace(prompt: string, options: IParams = GenerationParams): Promise<any> {
    const payload = this._buildPayload(prompt, options, WORKSPACE_PROMPT);

    if (options.stream_result) {
      return await this._streamInferenceRequest(payload, AIRequestType.GENERAL);
    } else {
      return await this._makeRequest(payload, AIRequestType.GENERAL);
    }
  }

  async answer(prompt: string, options: IParams = GenerationParams): Promise<any> {
    const payload = this._buildPayload(prompt, options, CHAT_PROMPT);
    if (options.stream_result) {
      return await this._streamInferenceRequest(payload, AIRequestType.GENERAL);
    } else {
      return await this._makeRequest(payload, AIRequestType.GENERAL);
    }
  }

  async code_explaining(prompt: string, context: string = "", options: IParams = GenerationParams): Promise<any> {
    const payload = this._buildPayload(prompt, options, CODE_EXPLANATION_PROMPT);
    if (options.stream_result) {
      return await this._streamInferenceRequest(payload, AIRequestType.GENERAL);
    } else {
      return await this._makeRequest(payload, AIRequestType.GENERAL);
    }
  }

  async error_explaining(prompt: string, options: IParams = GenerationParams): Promise<any> {

    const payload = this._buildPayload(prompt, options, ERROR_EXPLANATION_PROMPT);
    if (options.stream_result) {
      return await this._streamInferenceRequest(payload, AIRequestType.GENERAL);
    } else {
      return await this._makeRequest(payload, AIRequestType.GENERAL);
    }
  }

  async vulnerability_check(prompt: string, options: IParams = GenerationParams): Promise<any> {
    const payload = this._buildPayload(prompt, options, SECURITY_ANALYSIS_PROMPT);
    if (options.stream_result) {
      return await this._streamInferenceRequest(payload, AIRequestType.GENERAL);
    } else {
      return await this._makeRequest(payload, AIRequestType.GENERAL);
    }
  }
}
