export interface IElectronAPI {
  activatePlugin: (name: string) => Promise<boolean>
  receiveFromFS: (cb: any) => void
  sendToFS: (message: Partial<Message>) => void
  receiveFromGit: (cb: any) => void
  sendToGit: (message: Partial<Message>) => void
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}