import { StatusEvents } from "@remixproject/plugin-utils";
import { WorkspaceMetadata } from "libs/remix-ui/workspace/src/lib/types";

export interface ITopbarApi {
  events: {
    setWorkspace: (workspace: WorkspaceMetadata) => void,
    workspaceRenamed: (oldName: string, workspaceName: string) => void,
    workspaceDeleted: (workspace: WorkspaceMetadata) => void,
    workspaceCreated: (workspace: WorkspaceMetadata) => void,
  } & StatusEvents
  methods: {
      getWorkspaces: () => Promise<any>,
      createWorkspace: (workspaceName: string, workspaceTemplateName: string, isEmpty: boolean) => Promise<any>,
      renameWorkspace: (oldName: string, workspaceName: string) => Promise<any>,
      deleteWorkspace: (workspaceName: string) => Promise<any>,
      getCurrentWorkspaceMetadata: () => Promise<any>,
      setWorkspace: (workspace: WorkspaceMetadata) => Promise<any>,
      switchToWorkspace: (workspaceName: string) => Promise<any>,
      getCurrentWorkspace: () => Promise<any>,
  }
}
