import { StatusEvents } from "@remixproject/plugin-utils";

export interface IFs {
  events: {
    workingDirChanged(path: string): Promise<void>,
  } & StatusEvents,
  methods: {
    selectFolder(path?: string, title?: string, button?: string): Promise<string> 
    openWindow(path?: string): Promise<void>,
    getWorkingDir(): Promise<string>,
    openFolderInSameWindow(path: string): Promise<void>,
  }
}