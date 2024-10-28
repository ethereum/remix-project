import { StatusEvents } from "@remixproject/plugin-utils"

export interface IDgitPlugin {
  events: {
  } & StatusEvents,
  methods: {
      open(panel: string): Promise<void>,
      init(): Promise<void>
  }
}

