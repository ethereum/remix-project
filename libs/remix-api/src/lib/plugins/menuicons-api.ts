import { IFilePanel } from '@remixproject/plugin-api'
import { Profile, StatusEvents } from '@remixproject/plugin-utils'

export interface IMenuIconsApi {
    events: {
        toggleContent: (name: string) => void,
        showContent: (name: string) => void
    } & StatusEvents
    methods: {
        select: (name: string) => void
        linkContent: (profile: Profile) => void
        unlinkContent: (profile: Profile) => void
    }
}
