import { IconProfile } from 'libs/remix-ui/vertical-icons-panel/src/lib/components/Icon'

export interface PermissionHandlerValue {
    from: IconProfile,
    to: IconProfile,
    remember: boolean,
    method: string,
    message: string
}

export interface PermissionHandlerProps {
    value: PermissionHandlerValue
}
