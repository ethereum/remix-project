import { StatusEvents } from "@remixproject/plugin-utils"

export interface IConfigApi {
  events: {
    configChanged: () => void
  } & StatusEvents,
  methods: {
    getAppParameter(key: string): Promise<any>,
    setAppParameter(key: string, value: any): Promise<void>
  }
}