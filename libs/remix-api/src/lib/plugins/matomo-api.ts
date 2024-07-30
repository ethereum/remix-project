import { IFilePanel } from '@remixproject/plugin-api'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IMatonmoApi {
    events:{
    } & StatusEvents
    methods: {
        track: (data: string[]) => void
    }
}
