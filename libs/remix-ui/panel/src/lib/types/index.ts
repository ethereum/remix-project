import { Profile } from '@remixproject/plugin-utils'

export type PluginRecord = {
    profile: Profile
    view: any
    active: boolean
    class?: string
    minimized?: boolean
}
