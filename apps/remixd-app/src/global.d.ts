export interface IElectronAPI {
  startRemixd: (path: string) => Promise<void>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}