import { IFilePanel } from '@remixproject/plugin-api'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IMatomoApi {
    events:{
    } & StatusEvents
    methods: {
        track: (data: string[]) => void
    }
}
