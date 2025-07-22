export type AiContextType = "none" | "current" | "opened" | "workspace"

export type AiAssistantType = "openai" | "mistralai" | "anthropic"

export type groupListType = {
      label: string,
      bodyText: string,
      icon: 'fa-solid fa-check',
      dataId: string
      stateValue: AiContextType | AiAssistantType | any
    }
