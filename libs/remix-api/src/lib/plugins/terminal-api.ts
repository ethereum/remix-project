import { ITerminal } from "@remixproject/plugin-api/src/lib/terminal"
import { StatusEvents } from "@remixproject/plugin-utils"

export interface IExtendedTerminalApi extends ITerminal {
  events: {
  } & StatusEvents
  methods: ITerminal['methods'] & {
    logHtml(html: string): void
  }
}