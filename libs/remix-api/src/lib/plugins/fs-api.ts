import { StatusEvents } from "@remixproject/plugin-utils";

export interface IFs {
  events: {

  } & StatusEvents,
  methods: {
    selectFolder(path?: string, title?: string, button?: string): Promise<string> 
    openWindow(path?: string): Promise<void>,
  }
}