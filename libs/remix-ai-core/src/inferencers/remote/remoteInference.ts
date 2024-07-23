import { ICompletions, IParams, ChatEntry, AIRequestType, RemoteBackendOPModel } from "../../types/types";
import { PromptBuilder } from "../../prompts/promptBuilder";
import axios from "axios";
import EventEmitter from "events";

const defaultErrorMessage = `Unable to get a response from AI server`

export class RemoteInferencer implements ICompletions {
  api_url: string
  completion_url: string
  solgpt_chat_history:ChatEntry[]
  max_history = 7
  model_op = RemoteBackendOPModel.DEEPSEEK
  event: EventEmitter

  constructor(apiUrl?:string, completionUrl?:string) {
    this.api_url = apiUrl!==undefined ? apiUrl: "https://solcoder.remixproject.org"
    this.completion_url = completionUrl!==undefined ? completionUrl : "https://completion.remixproject.org"
    this.solgpt_chat_history = []
    this.event = new EventEmitter()
  }

  private pushChatHistory(prompt, result){
    const chat:ChatEntry = [prompt, result.data[0]]
    this.solgpt_chat_history.push(chat)
    if (this.solgpt_chat_history.length > this.max_history){this.solgpt_chat_history.shift()}
  }

  private async _makeRequest(data, rType:AIRequestType){
    this.event.emit("onInference")
    const requesURL = rType === AIRequestType.COMPLETION ? this.completion_url : this.api_url
    console.log("requesting on ", requesURL, rType, data.data[1])

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
          this.pushChatHistory(prompt, resultText)
          return resultText
        } else {
          return defaultErrorMessage
        }
      }

    } catch (e) {
      this.solgpt_chat_history = []
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
      const options = { headers: { 'Content-Type': 'application/json', "Accept": "text/event-stream" } }
      const response = await axios({
        method: 'post',
        url:  rType === AIRequestType.COMPLETION ? this.completion_url : this.api_url,
        data: data,
        headers: { 'Content-Type': 'application/json', "Accept": "text/event-stream" },
        responseType: 'stream'
      });

      response.data.on('data', (chunk: Buffer) => {
        try {
          const parsedData = JSON.parse(chunk.toString());
          if (parsedData.isGenerating) {
            this.event.emit('onStreamResult', parsedData.generatedText);
          } else {
            return parsedData.generatedText
          }

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }

      });

      return "" // return empty string for now as handled in event
    } catch (error) {
      console.error('Error making stream request to Inference server:', error.message);
    }
    finally {
      this.event.emit('onInferenceDone')
    }
  }

  async code_completion(prompt, options:IParams=null): Promise<any> {
    const payload = !options?
      { "data": [prompt, "code_completion", "", false, 30, 0.9, 0.90, 50]} :
      { "data": [prompt, "code_completion", "", options.stream_result,
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
    const main_prompt = this._build_solgpt_promt(prompt)
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

  private _build_solgpt_promt(user_promt:string){
    if (this.solgpt_chat_history.length === 0){
      return user_promt
    } else {
      let new_promt = ""
      for (const [question, answer] of this.solgpt_chat_history) {
        new_promt += PromptBuilder(question.split('sol-gpt')[1], answer, this.model_op)
      }
      // finaly
      new_promt = "sol-gpt " + new_promt + PromptBuilder(user_promt.split('sol-gpt')[1], "", this.model_op)
      return new_promt
    }
  }

}
