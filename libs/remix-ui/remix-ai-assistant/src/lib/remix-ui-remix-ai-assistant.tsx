import React, { useState, useEffect, RefObject } from 'react'
import '../css/remix-ai-assistant.css'
import ResponseZone from '../components/Responsezone'

import { DefaultModels, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core'
import { AiChatUI, ConversationStarter, StreamSend, StreamingAdapterObserver, useAiChatApi } from '@nlux/react'
import { AiChat, useAsStreamAdapter, ChatItem } from '@nlux/react'
// import { highlighter } from '@nlux/highlighter'
import '../css/color.css'
import '@nlux/themes/unstyled.css'
import copy from 'copy-to-clipboard'
import { UserPersona } from '@nlux/react'
import DefaultResponseContent from '../components/DefaultResponseContent'
import PromptZone from '../components/promptzone'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PluginNames } from 'apps/remix-ide/src/types'

const _paq = (window._paq = window._paq || [])

export const user: UserPersona = {
  name: 'Remi',
  avatar: 'assets/img/remix-logo-blue.png'
}

export const assistantAvatar = 'assets/img/remixai-logoDefault.webp'//'assets/img/aiLogo.svg'
export interface RemixUiRemixAiAssistantProps {
  makePluginCall(pluginName: PluginNames, methodName: string, payload?: any): Promise<any>
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
}

export let ChatApi = null

export function RemixUiRemixAiAssistant(props: any) {
  const [is_streaming, setIS_streaming] = useState<boolean>(false)

  const send: StreamSend = async (
    prompt: string,
    observer: StreamingAdapterObserver,
  ) => {
    GenerationParams.stream_result = true
    setIS_streaming(true)
    GenerationParams.return_stream_response = GenerationParams.stream_result
    let response = null
    const check = await props.plugin.call('remixAI', 'isChatRequestPending')
    if (check) {
      response = await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams)
    } else {
      response = await props.plugin.call('remixAI', 'solidity_answer', prompt, GenerationParams)
    }

    if (GenerationParams.return_stream_response) {
      HandleStreamResponse(response,
        (text) => {observer.next(text)},
        (result) => {
          observer.next(' ') // Add a space to flush the last message
          ChatHistory.pushHistory(prompt, result)
          observer.complete()
          setTimeout(() => { setIS_streaming(false) }, 1000)
        }
      )
    }
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
      icon: <i className="fa fa-user-robot-xmarks"></i>
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
    <div className="d-flex px-2 flex-column overflow-hidden pt-3 h-100 w-100">
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
        // initialConversation={initialMessages}
        conversationOptions={{ layout: 'bubbles', conversationStarters }}
        displayOptions={{ colorScheme: "auto", themeId: "remix_ai_theme" }}
        composerOptions={{ placeholder: "Ask me anything, start with @workspace to add context",
          submitShortcut: 'Enter',
          hideStopButton: false,
          remixMethodList: ['workspace', 'openedFiles', 'allFiles'],
          addContextFiles: props.makePluginCall
        }}
        addContextFiles={props.makePluginCall}
        messageOptions={{ showCodeBlockCopyButton: true,
          editableUserMessages: true,
          streamingAnimationSpeed: 2,
          waitTimeBeforeStreamCompletion: 1000,
          // syntaxHighlighter: highlighter,
          promptRenderer: ({ uid, prompt, onResubmit }) => <PromptRenderer uid={uid} prompt={prompt} onResubmit={onResubmit} />,
          responseRenderer: ({ uid, content, containerRef }) => <ResponseRenderer uid={uid}
            response={content as string[]} containerRef={containerRef} />
        }}
      />
    </div>
  )
}

function ResponseRenderer({ uid, response, containerRef }: { uid: string, response: string[], containerRef: RefObject<any> }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [sentiment, setSentiment] = useState<'like' | 'dislike' | 'none'>('none')

  const handleSentiment = (sentiment: string) => {
    if (sentiment === 'like') {
      (window as any)._paq.push(['trackEvent', 'remixai-assistant', 'like-response'])
      setSentiment('like')
      console.log('like')
    } else if (sentiment === 'dislike') {
      (window as any)._paq.push(['trackEvent', 'remixai-assistant', 'dislike-response'])
      setSentiment('dislike')
      console.log('dislike')
    } else {
      setSentiment('none')
      console.log('none')
    }
  }
  return (
    <>
      <section ref={containerRef} />
      {<div className="d-flex flex-row justify-content-between align-items-center mt-2">
        <span className={!isLiked ? 'far fa-thumbs-up fa-lg mr-3' : 'fas fa-thumbs-up fa-lg mr-3'} onClick={() => {
          const newLikedState = !isLiked;
          setIsLiked(newLikedState);
          if (newLikedState) {
            setIsDisliked(false);
            handleSentiment('like');
          } else {
            handleSentiment('none');
          }
        }}></span>
        <span className={!isDisliked ? 'far fa-thumbs-down fa-lg' : 'fas fa-thumbs-down fa-lg'} onClick={() => {
          const newDislikedState = !isDisliked;
          setIsDisliked(newDislikedState);
          if (newDislikedState) {
            setIsLiked(false);
            handleSentiment('dislike');
          } else {
            handleSentiment('none');
          }
        }}></span>
      </div>}
    </>
  )
}

function PromptRenderer({ uid, prompt, onResubmit }: { uid: string, prompt: string, onResubmit: (prompt: string) => void }) {
  return (
    <div key={uid} className="d-flex flex-column justify-content-between">
      <span className="text-muted font-weight-bold">
        You
      </span>
      <span className="">
        {prompt}
      </span>
    </div>
  )
}