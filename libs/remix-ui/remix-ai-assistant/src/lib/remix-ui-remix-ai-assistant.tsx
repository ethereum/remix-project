import React, { useState, useEffect } from 'react'
import '../css/remix-ai-assistant.css'
import PromptZone from '../components/promptzone'
import ResponseZone from '../components/Responsezone'

import { DefaultModels, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core'
import { ConversationStarter, StreamSend, StreamingAdapterObserver, useAiChatApi } from '@nlux/react'
import { AiChat, useAsStreamAdapter, ChatItem } from '@nlux/react'
import { highlighter } from '@nlux/highlighter'
import '../css/color.css'
import '@nlux/themes/unstyled.css'
import copy from 'copy-to-clipboard'
import { UserPersona } from '@nlux/react'

export const user: UserPersona = {
  name: 'Remi',
  avatar: 'assets/img/remix-logo-blue.png'
}

export const assistantAvatar = 'assets/img/aiLogo.svg'
export interface RemixUiRemixAiAssistantProps {
  makePluginCall(pluginName: string, methodName: string, payload: any): Promise<any>
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
}

export let ChatApi = null

export function RemixUiRemixAiAssistant(props: any) {
  const [is_streaming, setIS_streaming] = useState<boolean>(false)

  const HandleCopyToClipboard = () => {
    const markdown = document.getElementsByClassName('nlux-chatSegments-container')
    if (markdown.length < 1) return

    const codeBlocks = markdown[0].getElementsByClassName('code-block')
    Array.from(codeBlocks).forEach((block) => {
      const copyButtons = block.getElementsByClassName('nlux-comp-copyButton')
      Array.from(copyButtons).forEach((cp_btn) => {
        const hdlr = async () => {
          copy(block.textContent)
        }
        cp_btn.removeEventListener('click', async() => { hdlr() })
        cp_btn.addEventListener('click', async () => { hdlr() })
      })
    })
  }

  useEffect(() => {
    HandleCopyToClipboard()
  }, [is_streaming])

  const send: StreamSend = async (
    prompt: string,
    observer: StreamingAdapterObserver,
  ) => {
    GenerationParams.stream_result = true
    setIS_streaming(true)
    GenerationParams.return_stream_response = GenerationParams.stream_result

    let response = null
    if (await props.plugin.call('remixAI', 'isChatRequestPending')){
      response = await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams)
    } else {
      response = await props.plugin.call('remixAI', 'solidity_answer', prompt, GenerationParams)
    }

    if (GenerationParams.return_stream_response) HandleStreamResponse(response,
      (text) => {observer.next(text)},
      (result) => {
        observer.next(' ') // Add a space to flush the last message
        ChatHistory.pushHistory(prompt, result)
        observer.complete()
        setTimeout(() => { setIS_streaming(false) }, 1000)
      }
    )
    else {
      observer.next(response)
      observer.complete()

      setTimeout(() => { setIS_streaming(false) }, 1000)
    }
  }
  ChatApi = useAiChatApi()
  const conversationStarters: ConversationStarter[] = [
    {
      prompt: 'Ask to explain a solidity contract!',
      icon: 'fa fa-user-robot-xmarks'
    },
    { prompt: 'Ask to explain a function',
      icon: <i className="fa fa-user-robot-xmarks"></i>
    },
    { prompt: 'Ask to solve an error',
      icon: <i className="fa fa-user-robot-xmarks"></i>
    }
  ]

  // Define initial messages
  const initialMessages: ChatItem[] = [
    {
      role: 'assistant',
      message: 'Welcome to RemixAI! How can I assist you today?'
    }
  ]
  const adapter = useAsStreamAdapter(send, [])
  return (
    <div className="d-flex flex-column px-3 overflow-hidden pt-3 h-100 mx-2 w-100">
      {/* <section className="d-flex flex-column justify-content-center align-items-center align-self-center flex-grow-1 ai-assistant-top-height">
        <ResponseZone />
      </section> */}
      {/* <PromptZone /> */}
      <AiChat
        api={ChatApi}
        adapter={ adapter }
        personaOptions={{
          assistant: {
            name: "RemixAI",
            tagline: "RemixAI provides you personalized guidance as you build. It can break down concepts, answer questions about blockchain technology and assist you with your smart contracts.",
            avatar: assistantAvatar
          },
          user
        }}
        //initialConversation={initialMessages}
        conversationOptions={{ layout: 'bubbles', conversationStarters }}
        displayOptions={{ colorScheme: "auto", themeId: "remix_ai_theme" }}
        composerOptions={{ placeholder: "Ask me anything, use @ to mention file...",
          submitShortcut: 'Enter',
          hideStopButton: false,
        }}
        messageOptions={{ showCodeBlockCopyButton: true,
          editableUserMessages: true,
          streamingAnimationSpeed: 2,
          waitTimeBeforeStreamCompletion: 1000,
          syntaxHighlighter: highlighter
        }}
      />
    </div>
  )
}