import { IFilePanel } from '@remixproject/plugin-api'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IPopupPanelAPI {
    events:{
    } & StatusEvents
    methods: {
        showPopupPanel(state: boolean): void
    }
}
