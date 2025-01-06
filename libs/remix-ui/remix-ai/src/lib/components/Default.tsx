import React from 'react'
import '../remix-ai.css'
import { DefaultModels, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core';
import { ConversationStarter, StreamSend, StreamingAdapterObserver, useAiChatApi } from '@nlux/react';
import { AiChat, useAsStreamAdapter, ChatItem } from '@nlux/react';
import { user, assistantAvatar } from './personas';
import { highlighter } from '@nlux/highlighter'
import './color.css'
import '@nlux/themes/unstyled.css';

export let ChatApi = null

export const Default = (props) => {
  const send: StreamSend = async (
    prompt: string,
    observer: StreamingAdapterObserver,
  ) => {
    GenerationParams.stream_result = true
    GenerationParams.return_stream_response = GenerationParams.stream_result

    let response = null
    if (await props.plugin.call('remixAI', 'isChatRequestPending')){
      response = await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams);
    } else {
      response = await props.plugin.call('remixAI', 'solidity_answer', prompt, GenerationParams);
    }

    if (GenerationParams.return_stream_response) HandleStreamResponse(response,
      (text) => {observer.next(text)},
      (result) => {
        observer.next(' ') // Add a space to flush the last message
        ChatHistory.pushHistory(prompt, result)
        observer.complete()
        const codeBlocks = document.getElementsByClassName('code-block')

        // override copy button functionality
        Array.from(codeBlocks).forEach((block) => {
          // only 1 copy button per code block
          const copyButton = document.getElementsByClassName('nlux-comp-copyButton')
          copyButton[0].addEventListener('click', async () => {
            console.log('nlux copy button clicked');
            const text = block.textContent; //|| block.innerText;
            await navigator.clipboard.writeText(block.textContent);
          });
        })
      }
    )
    else {
      observer.next(response)
      observer.complete()
    }

  };
  ChatApi = useAiChatApi();
  const conversationStarters: ConversationStarter[] = [
    { prompt: 'Explain what is a solidity contract!' },
    { prompt: 'Explain briefly the current file in Editor' }]

  // Define initial messages
  const initialMessages: ChatItem[] = [
    {
      role: 'assistant',
      message: 'Welcome to RemixAI! How can I assist you today?'
    }
  ];
  const adapter = useAsStreamAdapter(send, []);

  return (
    <AiChat
      api={ChatApi}
      adapter={ adapter }
      personaOptions={{
        assistant: {
          name: "RemixAI",
          tagline: "Your Web3 AI Assistant",
          avatar: assistantAvatar
        },
        user
      }}
      //initialConversation={initialMessages}
      conversationOptions={{ layout: 'bubbles', conversationStarters }}
      displayOptions={{ colorScheme: "auto", themeId: "remix_ai_theme" }}
      composerOptions={{ placeholder: "Type your query",
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
  );
};