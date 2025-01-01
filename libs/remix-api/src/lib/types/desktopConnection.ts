export const desktopConnextionType = {
    connected: 'connected',
    disconnected: 'disconnected',
    disabled: 'disabled',
    alreadyConnected: 'alreadyConnected',
}

export type desktopConnection  = typeof desktopConnextionType[keyof typeof desktopConnextionType]