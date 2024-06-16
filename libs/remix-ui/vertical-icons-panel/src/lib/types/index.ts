import { Profile } from '@remixproject/plugin-utils'

export type IconRecord = {
    profile: Profile
    active: boolean
    pinned: boolean
    class?: string
    canbeDeactivated?: boolean
    isRequired?: boolean
    timestamp: number
}
