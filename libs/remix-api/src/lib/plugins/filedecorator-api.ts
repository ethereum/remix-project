import { fileDecoration } from '@remix-ui/file-decorators'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IFileDecoratorApi {
  events: {
  } & StatusEvents
  methods: {
    clearFileDecorators(path?: string): void
    setFileDecorators(decorators: fileDecoration[]): void
  }
}
