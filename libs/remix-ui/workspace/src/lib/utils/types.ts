export type TemplateType = {
    type: 'git' | 'plugin'
    url?: string
    branch?: string
    name?: string
    endpoint?: string
    params?: any[]
  }