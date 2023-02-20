export interface FileActionType {
    action: FileAction
    args: any
}

export type FileAction = "move"| "copy" | "movedir"| "rename" | "remove" | "writefile" | "create"