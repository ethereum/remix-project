export interface IElectronAPI {
  activatePlugin: (name: string) => Promise<boolean>
  plugins: {
    name: string
    activate: () => Promise<boolean>
    on: (cb: any) => void
    send: (message: Partial<Message>) => void
  }[]
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}