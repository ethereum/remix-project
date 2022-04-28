import { Profile } from '@remixproject/plugin-utils'

export interface PermissionHandlerValue {
    from: Profile,
    to: Profile,
    remember: boolean,
    method: string,
    message: string
}

export interface PermissionHandlerProps {
    value: PermissionHandlerValue
    theme: string
    plugin: any
}
