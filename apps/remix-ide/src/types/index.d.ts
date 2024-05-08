
export interface PluginProfile {
  name: string
  displayName: string
  description: string
  keywords?: string[]
  icon?: string
  url?: string
  methods?: string[]
  events?: string[]
  version?: string
}

export interface StatusBarInterface extends Plugin {
  htmlElement: HTMLDivElement
  events: EventEmitter
  dispatch: React.Dispatch<any>
  setDispatch(dispatch: React.Dispatch<any>): void
}
