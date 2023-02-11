import { StatusEvents } from '@remixproject/plugin-utils'
import { TerminalMessage } from './type';
export interface ITerminal {
  events: {   
  } & StatusEvents
  methods: {
    log(message: TerminalMessage): void
  }
}
