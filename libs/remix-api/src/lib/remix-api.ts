import { customDGitSystem } from "@remix-ui/git"
import { IRemixApi } from "@remixproject/plugin-api"
import { StatusEvents } from "@remixproject/plugin-utils"

export interface ICustomRemixApi extends IRemixApi {
  dgitApi: customDGitSystem
}

export declare type CustomRemixApi = Readonly<ICustomRemixApi>