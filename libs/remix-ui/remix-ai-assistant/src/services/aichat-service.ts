import { StreamingAdapterObserver, StreamSend } from '@nlux/core'
import { ChatHistory, GenerationParams, HandleStreamResponse } from '@remix/remix-ai-core'

export async function useAichatService (prompt: string, setIS_streaming: (isStreaming: boolean) => void, plugin: any, observer?: StreamingAdapterObserver): Promise<void> {
  GenerationParams.stream_result = true
  setIS_streaming(true)
  GenerationParams.return_stream_response = GenerationParams.stream_result

  let response = null
  if (await plugin.call('remixAI', 'isChatRequestPending')){
    response = await plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams);
  } else {
    response = await plugin.call('remixAI', 'solidity_answer', prompt, GenerationParams);
  }

  if (GenerationParams.return_stream_response) HandleStreamResponse(response,
    (text) => {observer?.next(text)},
    (result) => {
      observer?.next(' ') // Add a space to flush the last message
      ChatHistory.pushHistory(prompt, result)
      observer?.complete()
      setTimeout(() => { setIS_streaming(false) }, 1000)
    }
  )
  else {
    observer?.next(response)
    observer?.complete()

    setTimeout(() => { setIS_streaming(false) }, 1000)
  }
}

