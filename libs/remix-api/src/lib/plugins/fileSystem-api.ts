import { commitChange } from "@remix-ui/git";
import { IFileSystem } from "@remixproject/plugin-api"

// Extended interface with 'diff' method
export interface IExtendedFileSystem extends IFileSystem {
  methods: IFileSystem['methods'] & {
    diff(change: commitChange): Promise<void>
    isGitRepo(): Promise<boolean>
  };
}