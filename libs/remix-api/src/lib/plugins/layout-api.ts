import { IFilePanel } from '@remixproject/plugin-api'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface ILayoutApi {
    events:{
    } & StatusEvents
    methods: {
        maximisePinnedPanel: () => void
        maximiseSidePanel: () => void
        resetPinnedPanel: () => void
        resetSidePanel: () => void
    }
}
