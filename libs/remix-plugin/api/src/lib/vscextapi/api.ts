import { StatusEvents } from '@remixproject/plugin-utils'

export interface IVScodeExtAPI {
  events: {
  } & StatusEvents
  methods: {
    executeCommand(extension: string, command: string, payload?: any[]): any
  }
}
