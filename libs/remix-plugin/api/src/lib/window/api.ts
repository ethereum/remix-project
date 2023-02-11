import { StatusEvents } from '@remixproject/plugin-utils'

export interface IWindow {
  events: {} & StatusEvents
  methods: {
    /** Display an input window */
    prompt(message?: string): string
    /** Ask confirmation for an action */
    confirm(message: string): boolean
    /** Display a message with actions button. Returned the button clicked if any */
    alert(message: string, actions?: string[]): string | void
  }
}
