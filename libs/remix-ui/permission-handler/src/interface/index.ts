import { Profile } from '@remixproject/plugin-utils'

export interface PermissionHandlerValue {
    from: Profile,
    to: Profile,
    remember: boolean,
    method: string,
    message: string,
    sensitiveCall: boolean
}

export interface PermissionHandlerProps {
    value: PermissionHandlerValue
    theme: string
    plugin: any
}
