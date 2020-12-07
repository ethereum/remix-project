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
    addFile: (parentFolder: string, fileName: string) => void,
    createNewFile: (folder?: string) => void,
    files: any,
    accessToken: string
}

export interface FileExplorerContextMenuProps {
    actions: { name: string, type: string[] }[],
    createNewFile: (folder?: string) => void
    hideContextMenu: () => void,
    pageX: number,
    pageY: number,
    folder?: string
}
