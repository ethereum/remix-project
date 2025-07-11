import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, MutableRefObject } from 'react'
import '../css/remix-ai-assistant.css'

import { ChatCommandParser, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core'
import { HandleOpenAIResponse, HandleMistralAIResponse, HandleAnthropicResponse } from '@remix/remix-ai-core'
import '../css/color.css'
import { Plugin } from '@remixproject/engine'
import { ModalTypes } from '@remix-ui/app'
import { PromptArea } from './prompt'
import { ChatHistoryComponent } from './chat'
import { ActivityType, ChatMessage } from '../lib/types'
import { groupListType } from '../types/componentTypes'
import GroupListMenu from './contextOptMenu'
import { useOnClickOutside } from './onClickOutsideHook'

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
    'mistralai'
  )
  const [contextChoice, setContextChoice] = useState<'none' | 'current' | 'opened' | 'workspace'>(
    'none'
  )

  const historyRef = useRef<HTMLDivElement | null>(null)
  const modelBtnRef = useRef(null)
  const contextBtnRef = useRef(null)

  useOnClickOutside([modelBtnRef, contextBtnRef], () => setShowAssistantOptions(false))
  useOnClickOutside([modelBtnRef, contextBtnRef], () => setShowContextOptions(false))

  const getBoundingRect = (ref: MutableRefObject<any>) => ref.current?.getBoundingClientRect()
  const calcAndConvertToDvh = (coordValue: number) => (coordValue / window.innerHeight) * 100
  const calcAndConvertToDvw = (coordValue: number) => (coordValue / window.innerWidth) * 100
  const chatCmdParser = new ChatCommandParser(props.plugin)

  const aiContextGroupList: groupListType[] = [
    {
      label: 'None',
      bodyText: 'Uses no context',
      icon: 'fa-solid fa-check',
      stateValue: 'none',
      dataId: 'composer-ai-context-none'
    },
    {
      label: 'Current file',
      bodyText: 'Uses the current file in the editor as context',
      icon: 'fa-solid fa-check',
      stateValue: 'current',
      dataId: 'currentFile-context-option'
    },
    {
      label: 'All opened files',
      bodyText: 'Uses all files opened in the editor as context',
      icon: 'fa-solid fa-check',
      stateValue: 'opened',
      dataId: 'allOpenedFiles-context-option'
    },
    {
      label: 'Workspace',
      bodyText: 'Uses the current workspace as context',
      icon: 'fa-solid fa-check',
      stateValue: 'workspace',
      dataId: 'workspace-context-option'
    }
  ]

  const aiAssistantGroupList: groupListType[] = [
    {
      label: 'OpenAI',
      bodyText: 'Better for general purpose coding tasks',
      icon: 'fa-solid fa-check',
      stateValue: 'openai',
      dataId: 'composer-ai-assistant-openai'
    },
    {
      label: 'MistralAI',
      bodyText: 'Better for more complex coding tasks with solidity, typescript and more',
      icon: 'fa-solid fa-check',
      stateValue: 'mistralai',
      dataId: 'composer-ai-assistant-mistralai'
    },
    {
      label: 'Anthropic',
      bodyText: 'Best for complex coding tasks but most demanding on resources',
      icon: 'fa-solid fa-check',
      stateValue: 'anthropic',
      dataId: 'composer-ai-assistant-anthropic'
    }
  ]

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
      _paq.push(['trackEvent', 'remixAI', 'AddingAIContext', choice])
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

  // useEffect(() => {
  //   const fetchAssistantChoice = async () => {
  //     console.log('Fetching assistant choice from plugin')
  //     const choice = await props.plugin.call('remixAI', 'getAssistantProvider')
  //     setAssistantChoice(choice || 'openai')
  //   }
  //   fetchAssistantChoice()
  // }, [props.plugin])

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
        GenerationParams.threadId = await props.plugin.call('remixAI', 'getAssistantThrId') || ""

        const pending = await props.plugin.call('remixAI', 'isChatRequestPending')
        const response = pending
          ? await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams)
          : await props.plugin.call('remixAI', 'answer', trimmed, GenerationParams)

        const assistantId = crypto.randomUUID()
        setMessages(prev => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), sentiment: 'none' }
        ])

        switch (assistantChoice) {
        case 'openai':
          HandleOpenAIResponse(
            response,
            (chunk: string) => appendAssistantChunk(assistantId, chunk),
            (finalText: string, threadId) => {
              ChatHistory.pushHistory(trimmed, finalText)
              setIsStreaming(false)
              props.plugin.call('remixAI', 'setAssistantThrId', threadId)
            }
          )
          break;
        case 'mistralai':
          HandleMistralAIResponse(
            response,
            (chunk: string) => appendAssistantChunk(assistantId, chunk),
            (finalText: string, threadId) => {
              ChatHistory.pushHistory(trimmed, finalText)
              setIsStreaming(false)
              props.plugin.call('remixAI', 'setAssistantThrId', threadId)
            }
          )
          // Add MistralAI handler here if available
          break;
        case 'anthropic':
          HandleAnthropicResponse(
            response,
            (chunk: string) => appendAssistantChunk(assistantId, chunk),
            (finalText: string, threadId) => {
              ChatHistory.pushHistory(trimmed, finalText)
              setIsStreaming(false)
              props.plugin.call('remixAI', 'setAssistantThrId', threadId)
            }
          )
          // Add Anthropic handler here if available
          break;
        default:
          HandleStreamResponse(
            response,
            (chunk: string) => appendAssistantChunk(assistantId, chunk),
            (finalText: string) => {
              ChatHistory.pushHistory(trimmed, finalText)
              setIsStreaming(false)
            }
          )
        }
        setIsStreaming(false)
      }
      catch (error) {
        console.error('Error sending prompt:', error)
        setIsStreaming(false)
        // Add error message to chat history
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${error.message}`,
            timestamp: Date.now(),
            sentiment: 'none'
          }
        ])
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
    const fetchAssistantChoice = async () => {
      const choiceSetting = await props.plugin.call('remixAI', 'getAssistantProvider')
      if (choiceSetting !== assistantChoice) {
        dispatchActivity('button', 'setAssistant')
        setMessages([])
        sendPrompt(`/setAssistant ${assistantChoice}`)
        setAssistantChoice(assistantChoice || 'mistralai')
        _paq.push(['trackEvent', 'remixAI', 'SetAIProvider', assistantChoice])
      }
    }
    fetchAssistantChoice()
  }, [assistantChoice])

  // refresh context whenever selection changes (even if selector is closed)
  useEffect(() => {
    refreshContext(contextChoice)
  }, [contextChoice, refreshContext])

  const modalMessage = () => {
    return (
      <ul className="p-3">
        <div className="mb-2">
          <span>Write a command and it will execute it by creating a new workspace e.g:</span>
        </div>
        <li>
          <span className="font-italic font-weight-light">Create an ERC‑20 token with all explanations as comments in the contract,</span>
        </li>
        <li>
          <span className="font-italic font-weight-light">Create a Voting contract and explain the contract with comments,</span>
        </li>
        <li>
          <span className="font-italic font-weight-light">Create a proxy contract with all explanations about the contract as comments</span>
        </li>
      </ul>
    )
  }

  const handleGenerateWorkspace = useCallback(async () => {
    dispatchActivity('button', 'generateWorkspace')
    try {
      const description: string = await new Promise((resolve, reject) => {
        const modalContent = {
          id: 'generate-workspace',
          title: 'Generate Workspace',
          message: modalMessage(),
          placeholderText: 'Create a Voting contract and explain the contract',
          modalType: ModalTypes.textarea,
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
        _paq.push(['trackEvent', 'remixAI', 'GenerateNewAIWorkspaceFromModal', description])
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
      className="d-flex flex-column h-100 mx-3 "
    >
      <section id="remix-ai-chat-history" className="h-83 d-flex flex-column align-items-center p-2" style={{ flex: 7, overflowY: 'scroll' }}>
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
      </section>
      <section id="remix-ai-prompt-area" className=" mt-1" style={{ flex: 1 }}
      >
        {showAssistantOptions && (
          <div
            className="pt-2 mb-2 z-3 bg-light border border-text"
            style={{ borderRadius: '8px', left: `${calcAndConvertToDvw(getBoundingRect(modelBtnRef).left)}dvw`, right: '0px', bottom: '75px', height: '235px', width: '300px', }}
          >
            <div className="text-uppercase ml-2 mb-2 small">AI Assistant Provider</div>
            <GroupListMenu
              setChoice={setAssistantChoice}
              setShowOptions={setShowAssistantOptions}
              choice={assistantChoice}
              groupList={aiAssistantGroupList}
            />
          </div>
        )}
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
          contextBtnRef={contextBtnRef}
          modelBtnRef={modelBtnRef}
          aiContextGroupList={aiContextGroupList}
          aiAssistantGroupList={aiAssistantGroupList}
        />
      </section>
    </div>
  )
})

