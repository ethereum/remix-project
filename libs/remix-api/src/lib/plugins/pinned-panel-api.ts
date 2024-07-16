import { IFilePanel } from '@remixproject/plugin-api'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IPinnedPanelApi {
    events:{
        
    } & StatusEvents
    methods: {
        currentFocus(): Promise<string>
    }
}
