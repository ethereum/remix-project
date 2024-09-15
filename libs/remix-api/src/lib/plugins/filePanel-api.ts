import { IFilePanel } from '@remixproject/plugin-api'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IFilePanelApi {
    events: IFilePanel['events'] & {
        workspaceInitializationCompleted: () => void;
        switchToWorkspace: (workspace: string) => Promise<void>;
    } & StatusEvents
    methods: IFilePanel['methods'] & {
        clone: () => Promise<void>;
    }
}
