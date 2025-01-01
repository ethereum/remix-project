export const desktopConnextionType = {
    connected: 'connected',
    disconnected: 'disconnected',
    disabled: 'disabled'
}

export type desktopConnection  = typeof desktopConnextionType[keyof typeof desktopConnextionType]