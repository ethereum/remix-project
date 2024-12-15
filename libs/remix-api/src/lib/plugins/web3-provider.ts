import { StatusEvents } from '@remixproject/plugin-utils'
import { JsonDataRequest, JsonDataResult } from '../types/rpc'

export interface IWeb3Provider {
  events: {
  } & StatusEvents
  methods: {
    init(): void
    sendAsync(payload: JsonDataRequest): Promise<JsonDataResult>
  }

}
