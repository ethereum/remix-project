import React, { useState, useEffect, useRef } from 'react'
import '../remix-ai.css'
import { DefaultModels, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core';
import { ConversationStarter, StreamSend, StreamingAdapterObserver, useAiChatApi } from '@nlux/react';
import { AiChat, useAsStreamAdapter, ChatItem } from '@nlux/react';
import { user, assistantAvatar } from './personas';
import { highlighter } from '@nlux/highlighter'
import './color.css'
import '@nlux/themes/unstyled.css';
import copy from 'copy-to-clipboard'

// Using DOMPurify for sanitization
import DOMPurify from 'dompurify';

// Function to sanitize user input
const sanitizeInput = (input: string) => DOMPurify.sanitize(input);

export let ChatApi = null

export const Default = (props) => {
  const [is_streaming, setIS_streaming] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null);

  // use refs to access the DOM elements and remove event listeners when unmounting
  useEffect(() => {
    if (containerRef.current) {

      const textArea = containerRef.current?.getElementsByClassName('nlux-comp-composer')[0].getElementsByTagName('textarea')[0]
      if (!textArea) return;
    
      const onInput = (e: Event) => {
        const sanitizedInput = sanitizeInput((e.target as HTMLTextAreaElement).value);
        if (sanitizedInput !== (e.target as HTMLTextAreaElement).value) {
          (e.target as HTMLTextAreaElement).value = sanitizedInput;
        }
      };
      
      textArea.addEventListener('input', onInput);
      
      const sendButton = containerRef.current?.getElementsByClassName('nlux-comp-composer')[0].getElementsByTagName('button')[0];
      const onClick = (e: Event) => {

        if (textArea) {
          const sanitized = sanitizeInput(textArea.value);
          
          if (sanitized !== textArea.value) {
            textArea.value = sanitized;
          }
        }
      };
      if (sendButton) {
        sendButton.addEventListener('click', onClick);
      }

      return () => {
        textArea.removeEventListener('input', onInput);
        if (sendButton) sendButton.removeEventListener('click', onClick);
      };
    }
  }, [containerRef]);

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
    HandleCopyToClipboard();
  }, [is_streaming]);

  const send: StreamSend = async (
    prompt: string,
    observer: StreamingAdapterObserver,
  ) => {
    const cleanPrompt = sanitizeInput(prompt);
    GenerationParams.stream_result = true
    setIS_streaming(true)
    GenerationParams.return_stream_response = GenerationParams.stream_result

    let response = null
    if (await props.plugin.call('remixAI', 'isChatRequestPending')){
      response = await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams);
    } else {
      response = await props.plugin.call('remixAI', 'solidity_answer', cleanPrompt, GenerationParams);
    }

    if (GenerationParams.return_stream_response) HandleStreamResponse(response,
      (text) => {observer.next(text)},
      (result) => {
        observer.next(' ') // Add a space to flush the last message
        ChatHistory.pushHistory(cleanPrompt, result)
        observer.complete()
        setTimeout(() => { setIS_streaming(false) }, 1000)
      }
    )
    else {
      observer.next(response)
      observer.complete()

      setTimeout(() => { setIS_streaming(false) }, 1000)
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
    <span ref={containerRef}>
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
        streamingAnimationSpeed: 1,
        waitTimeBeforeStreamCompletion: 1000,
        syntaxHighlighter: highlighter
      }}
    />

    </span>
  );
};