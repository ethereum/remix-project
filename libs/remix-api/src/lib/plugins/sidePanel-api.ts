import { IFilePanel } from '@remixproject/plugin-api'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface ISidePanelApi {
    events:{
        focusChanged: (name: string) => void;
    } & StatusEvents
    methods: {
        
    }
}
