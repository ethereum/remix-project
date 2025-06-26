import React, { useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react'
import '../css/remix-ai-assistant.css'

import { ChatCommandParser, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core'
import '../css/color.css'
import { Plugin } from '@remixproject/engine'
import { ModalTypes } from '@remix-ui/app'
import { PromptArea } from './prompt'
import { ChatHistoryComponent } from './chat'
import { ActivityType, ChatMessage } from '../lib/types'
import { AiContextType } from '../types/componentTypes'

const _paq = (window._paq = window._paq || [])

export interface RemixUiRemixAiAssistantProps {
  plugin: Plugin
  queuedMessage: { text: string; timestamp: number } | null
  initialMessages?: ChatMessage[]
  onMessagesChange?: (msgs: ChatMessage[]) => void
  /** optional callback whenever the user or AI does something */
  onActivity?: (type: ActivityType, payload?: any) => void
}
export interface RemixUiRemixAiAssistantHandle {
  /** Programmatically send a prompt to the chat (returns after processing starts) */
  sendChat: (prompt: string) => Promise<void>
  /** Clears local chat history (parent receives onMessagesChange([])) */
  clearChat: () => void
  /** Returns current chat history array */
  getHistory: () => ChatMessage[]
}

export const RemixUiRemixAiAssistant = React.forwardRef<
  RemixUiRemixAiAssistantHandle,
  RemixUiRemixAiAssistantProps
>(function RemixUiRemixAiAssistant(props, ref) {
  const [messages, setMessages] = useState<ChatMessage[]>(props.initialMessages || [])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showContextOptions, setShowContextOptions] = useState(false)
  const [showAssistantOptions, setShowAssistantOptions] = useState(false)
  const [assistantChoice, setAssistantChoice] = useState<'openai' | 'mistralai' | 'anthropic'>(
    null
  )
  const [contextChoice, setContextChoice] = useState<AiContextType>(
    'none'
  )
  const historyRef = useRef<HTMLDivElement | null>(null)
  const chatCmdParser = new ChatCommandParser(props.plugin)

  const dispatchActivity = useCallback(
    (type: ActivityType, payload?: any) => {
      props.onActivity?.(type, payload)
    },
    [props.onActivity]
  )
  const [contextFiles, setContextFiles] = useState<string[]>([])
  const clearContext = () => {
    setContextChoice('none')
    setContextFiles([])
    props.plugin.call('remixAI', 'setContextFiles', { context: 'none' })
  }
  const refreshContext = useCallback(async (choice: typeof contextChoice) => {
    try {
      let files: string[] = []
      switch (choice) {
      case 'none':
        await props.plugin.call('remixAI', 'setContextFiles', { context: 'none' })
        files = []
        break
      case 'current':
        {
          const f = await props.plugin.call('fileManager', 'getCurrentFile')
          if (f) files = [f]
          await props.plugin.call('remixAI', 'setContextFiles', { context: 'currentFile' })
        }
        break
      case 'opened':
        {
          const res = await props.plugin.call('fileManager', 'getOpenedFiles')
          if (Array.isArray(res)) {
            files = res
          } else if (res && typeof res === 'object') {
            files = Object.values(res) as string[]
          }
          await props.plugin.call('remixAI', 'setContextFiles', { context: 'openedFiles' })
        }
        break
      case 'workspace':
        {
          await props.plugin.call('remixAI', 'setContextFiles', { context: 'workspace' })
          files = ['@workspace']
        }
        break
      }
      setContextFiles(files)
    } catch (err) {
      console.error('Failed to refresh context:', err)
    }
  }, [props.plugin])

  useEffect(() => {
    const update = () => refreshContext(contextChoice)

    if (contextChoice === 'current' || contextChoice === 'opened') {
      props.plugin.on('fileManager', 'currentFileChanged', update)
      props.plugin.on('fileManager', 'fileClosed', update)
      return () =>
        props.plugin.off('fileManager', 'currentFileChanged')
    }
  }, [contextChoice, refreshContext, props.plugin])

  // bubble messages up to parent
  useEffect(() => {
    props.onMessagesChange?.(messages)
  }, [messages, props.onMessagesChange])

  // always scroll to bottom when messages change
  useEffect(() => {
    const node = historyRef.current
    if (node && messages.length > 0) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages])

  // helper to toggle like / dislike feedback and push Matomo events
  const recordFeedback = (msgId: string, next: 'like' | 'dislike' | 'none') => {
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, sentiment: next } : m))
    )
    if (next === 'like') {
      ; (window as any)._paq?.push(['trackEvent', 'remixai-assistant', 'like-response'])
    } else if (next === 'dislike') {
      ; (window as any)._paq?.push(['trackEvent', 'remixai-assistant', 'dislike-response'])
    }
  }

  // Push a queued message (if any) into history once props update
  useEffect(() => {
    if (props.queuedMessage) {
      const { text, timestamp } = props.queuedMessage
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: text, timestamp }
      ])
    }
  }, [props.queuedMessage])

  // reusable sender (used by both UI button and imperative ref)
  const sendPrompt = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim()
      if (!trimmed || isStreaming) return

      dispatchActivity('promptSend', trimmed)

      // optimistic user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, userMsg])

      /** append streaming chunks helper (kept identical) */
      const appendAssistantChunk = (msgId: string, chunk: string) => {
        setMessages(prev =>
          prev.map(m => (m.id === msgId ? { ...m, content: m.content + chunk } : m))
        )
      }

      try {
        setIsStreaming(true)
        const parseResult = await chatCmdParser.parse(trimmed)
        if (parseResult) {
          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: parseResult,
              timestamp: Date.now(),
              sentiment: 'none'
            }
          ])
          setIsStreaming(false)
          return
        }

        GenerationParams.stream_result = true
        GenerationParams.return_stream_response = true

        const pending = await props.plugin.call('remixAI', 'isChatRequestPending')
        const response = pending
          ? await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams)
          : await props.plugin.call('remixAI', 'solidity_answer', trimmed, GenerationParams)

        const assistantId = crypto.randomUUID()
        setMessages(prev => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), sentiment: 'none' }
        ])

        HandleStreamResponse(
          response,
          (chunk: string) => appendAssistantChunk(assistantId, chunk),
          (finalText: string) => {
            ChatHistory.pushHistory(trimmed, finalText)
            setIsStreaming(false)
          }
        )
      } catch (err) {
        console.error('AI request failed:', err)
        setIsStreaming(false)
      }
    },
    [isStreaming, props.plugin]
  )

  const handleSend = useCallback(async () => {
    await sendPrompt(input)
    setInput('')
  }, [input, sendPrompt])

  // Added handlers for special command buttons (assumed to exist)
  const handleAddContext = useCallback(() => {
    dispatchActivity('button', 'addContext')
    setShowAssistantOptions(false)
    setShowContextOptions(prev => !prev)
  }, [])

  const handleSetAssistant = useCallback(() => {
    dispatchActivity('button', 'setAssistant')
    setShowContextOptions(false)
    setShowAssistantOptions(prev => !prev)
  }, [])

  // Only send the /setAssistant command when the choice actually changes
  useEffect(() => {
    if (!assistantChoice) return
    dispatchActivity('button', 'setAssistant')
    sendPrompt(`/setAssistant ${assistantChoice}`)
  }, [assistantChoice])

  // refresh context whenever selection changes (even if selector is closed)
  useEffect(() => {
    refreshContext(contextChoice)
  }, [contextChoice, refreshContext])

  const handleGenerateWorkspace = useCallback(async () => {
    dispatchActivity('button', 'generateWorkspace')
    try {
      const description: string = await new Promise((resolve, reject) => {
        const modalContent = {
          id: 'generate-workspace',
          title: 'Generate Workspace',
          message: `
            Describe the kind of workspace you want RemixAI to scaffold. For example:
            ERC‑20 token with foundry tests
            ERC‑721 NFT collection with IPFS metadata
            Decentralized voting app with Solidity smart contracts

          `,
          modalType: ModalTypes.prompt, // single-line text
          okLabel: 'Generate',
          cancelLabel: 'Cancel',
          okFn: (value: string) => setTimeout(() => resolve(value), 0),
          cancelFn: () => setTimeout(() => reject(new Error('Canceled')), 0),
          hideFn: () => setTimeout(() => reject(new Error('Hide')), 0)
        }
        // @ts-ignore – the notification plugin's modal signature
        props.plugin.call('notification', 'modal', modalContent)
      })

      if (description && description.trim()) {
        sendPrompt(`/generate ${description.trim()}`)
      }
    } catch {
      /* user cancelled */
    }
  }, [props.plugin, sendPrompt])

  useImperativeHandle(
    ref,
    () => ({
      sendChat: async (prompt: string) => {
        await sendPrompt(prompt)
      },
      clearChat: () => {
        setMessages([])
      },
      getHistory: () => messages
    }),
    [sendPrompt, messages]
  )

  return (
    <div
      className="d-flex flex-column h-100 mx-3"
    >
      <div data-id="remix-ai-assistant-ready"></div>
      {/* hidden hook for E2E tests: data-streaming="true|false" */}
      <div
        data-id="remix-ai-streaming"
        className='d-none'
        data-streaming={isStreaming ? 'true' : 'false'}
      ></div>
      <ChatHistoryComponent
        messages={messages}
        isStreaming={isStreaming}
        sendPrompt={sendPrompt}
        recordFeedback={recordFeedback}
        historyRef={historyRef}
      />
      <PromptArea
        input={input}
        setInput={setInput}
        isStreaming={isStreaming}
        handleSend={handleSend}
        showContextOptions={showContextOptions}
        setShowContextOptions={setShowContextOptions}
        showAssistantOptions={showAssistantOptions}
        setShowAssistantOptions={setShowAssistantOptions}
        contextChoice={contextChoice}
        setContextChoice={setContextChoice}
        assistantChoice={assistantChoice}
        setAssistantChoice={setAssistantChoice}
        contextFiles={contextFiles}
        clearContext={clearContext}
        handleAddContext={handleAddContext}
        handleSetAssistant={handleSetAssistant}
        handleGenerateWorkspace={handleGenerateWorkspace}
        dispatchActivity={dispatchActivity}
      />
    </div>
  )
})

