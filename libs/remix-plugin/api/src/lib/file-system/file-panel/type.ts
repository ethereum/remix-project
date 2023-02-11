export interface customAction {
    id: string,
    name: string,
    type: customActionType[],
    path: string[],
    extension: string[],
    pattern: string[],
    sticky?: boolean,
    label?: string
}

export type customActionType = 'file' | 'folder'