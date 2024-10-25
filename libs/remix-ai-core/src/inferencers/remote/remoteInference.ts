import { ICompletions, IParams, AIRequestType, RemoteBackendOPModel } from "../../types/types";
import { buildSolgptPromt } from "../../prompts/promptBuilder";
import axios from "axios";
import EventEmitter from "events";
import { ChatHistory } from "../../prompts/chat";

const defaultErrorMessage = `Unable to get a response from AI server`

export class RemoteInferencer implements ICompletions {
  api_url: string
  completion_url: string
  max_history = 7
  model_op = RemoteBackendOPModel.CODELLAMA // default model operation change this to llama if necessary
  event: EventEmitter

  constructor(apiUrl?:string, completionUrl?:string) {
    this.api_url = apiUrl!==undefined ? apiUrl: "https://solcoder.remixproject.org"
    this.completion_url = completionUrl!==undefined ? completionUrl : "https://completion.remixproject.org"
    this.event = new EventEmitter()
  }

  private async _makeRequest(data, rType:AIRequestType){
    this.event.emit("onInference")
    const requesURL = rType === AIRequestType.COMPLETION ? this.completion_url : this.api_url
    const userPrompt = data.data[0]

    try {
      const result = await axios(requesURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(data),
      })

      switch (rType) {
      case AIRequestType.COMPLETION:
        if (result.statusText === "OK")
          return result.data.data[0]
        else {
          return defaultErrorMessage
        }
      case AIRequestType.GENERAL:
        if (result.statusText === "OK") {
          const resultText = result.data.data[0]
          ChatHistory.pushHistory(userPrompt, resultText)
          return resultText
        } else {
          return defaultErrorMessage
        }
      }

    } catch (e) {
      ChatHistory.clearHistory()
      console.error('Error making request to Inference server:', e.message)
      return e
    }
    finally {
      this.event.emit("onInferenceDone")
    }
  }

  private async _streamInferenceRequest(data, rType:AIRequestType){
    try {
      this.event.emit('onInference')
      const requesURL = rType === AIRequestType.COMPLETION ? this.completion_url : this.api_url
      const userPrompt = data.data[0]
      const response = await axios({
        method: 'post',
        url:  requesURL,
        data: data,
        headers: { 'Content-Type': 'application/json', "Accept": "text/event-stream" },
        responseType: 'stream'
      });

      let resultText = ""
      response.data.on('data', (chunk: Buffer) => {
        try {
          const parsedData = JSON.parse(chunk.toString());
          if (parsedData.isGenerating) {
            this.event.emit('onStreamResult', parsedData.generatedText);
            resultText = resultText + parsedData.generatedText
          } else {
            // stream generation is complete
            resultText = resultText + parsedData.generatedText
            ChatHistory.pushHistory(userPrompt, resultText)
            return parsedData.generatedText
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          ChatHistory.clearHistory()
        }
      });

      return "" // return empty string for now as handled in event
    } catch (error) {
      ChatHistory.clearHistory()
      console.error('Error making stream request to Inference server:', error.message);
    }
    finally {
      this.event.emit('onInferenceDone')
    }
  }

  async code_completion(prompt, promptAfter, options:IParams=null): Promise<any> {
    const payload = !options?
      { "data": [prompt, "code_completion", promptAfter, false, 30, 0.9, 0.90, 50]} :
      { "data": [prompt, "code_completion", promptAfter, options.stream_result,
        options.max_new_tokens, options.temperature, options.top_p, options.top_k]
      }

    return this._makeRequest(payload, AIRequestType.COMPLETION)
  }

  async code_insertion(msg_pfx, msg_sfx): Promise<any> {
    const payload = { "data":[msg_pfx, "code_insertion", msg_sfx, 1024, 0.5, 0.92, 50]}
    return this._makeRequest(payload, AIRequestType.COMPLETION)
  }

  async code_generation(prompt): Promise<any> {
    const payload = { "data":[prompt, "code_completion", "", false,1000,0.9,0.92,50]}
    return this._makeRequest(payload, AIRequestType.COMPLETION)
  }

  async solidity_answer(prompt): Promise<any> {
    const main_prompt = buildSolgptPromt(prompt, this.model_op)
    const payload = { "data":[main_prompt, "solidity_answer", false,2000,0.9,0.8,50]}
    return this._makeRequest(payload, AIRequestType.GENERAL)
  }

  async code_explaining(prompt, context:string=""): Promise<any> {
    const payload = { "data":[prompt, "code_explaining", false,2000,0.9,0.8,50, context]}
    return this._makeRequest(payload, AIRequestType.GENERAL)
  }

  async error_explaining(prompt): Promise<any> {
    const payload = { "data":[prompt, "error_explaining", false,2000,0.9,0.8,50]}
    return this._makeRequest(payload, AIRequestType.GENERAL)
  }
}
