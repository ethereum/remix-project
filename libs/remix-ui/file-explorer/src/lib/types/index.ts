/* eslint-disable-next-line */
export interface FileExplorerProps {
    name: string,
    registry: any,
    files: any,
    menuItems?: string[],
    plugin: any
}

export interface File {
    path: string,
    name: string,
    isDirectory: boolean,
    child?: File[]
}

export interface FileExplorerMenuProps {
    title: string,
    menuItems: string[],
    fileManager: any,
    addFile: (parent: string, fileName: string) => void,
    createNewFile: (parentFolder?: string) => void,
    files: any,
    accessToken: string
}

export interface FileExplorerContextMenuProps {
    actions: { name: string, type: string[] }[],
    createNewFile: (parentFolder?: string) => void
    hideContextMenu: () => void,
    pageX: number,
    pageY: number
}
