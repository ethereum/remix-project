import { StatusEvents } from '@remixproject/plugin-utils'
import { customAction } from './type';
export interface IFilePanel {
    events: {
        setWorkspace: (workspace:any) => void
        workspaceRenamed: (workspace:any) => void
        workspaceDeleted: (workspace:any) => void
        workspaceCreated: (workspace:any) => void
        customAction: (cmd: customAction) => void
    } & StatusEvents
    methods: {
        getCurrentWorkspace(): { name: string, isLocalhost: boolean, absolutePath: string }
        getWorkspaces(): string[]
        deleteWorkspace(name:string): void
        createWorkspace(name:string, isEmpty:boolean): void
        renameWorkspace(oldName:string, newName:string): void
        registerContextMenuItem(cmd: customAction): void
    }
}
