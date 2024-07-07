import { IGitApi } from "@remix-ui/git"
import { IRemixApi } from "@remixproject/plugin-api"
import { StatusEvents } from "@remixproject/plugin-utils"
import { IConfigApi } from "./plugins/config-api"
import { IFileDecoratorApi } from "./plugins/filedecorator-api"
import { IExtendedFileSystem } from "./plugins/fileSystem-api"
import { INotificationApi } from "./plugins/notification-api"
import { ISettings } from "./plugins/settings-api"
import { IFilePanelApi } from "./plugins/filePanel-api"
import { Plugin } from "@remixproject/engine"

export interface ICustomRemixApi extends IRemixApi {
  dgitApi: IGitApi
  config: IConfigApi
  notification: INotificationApi
  settings: ISettings
  fileDecorator: IFileDecoratorApi
  fileManager: IExtendedFileSystem
  filePanel: IFilePanelApi
}

export declare type CustomRemixApi = Readonly<ICustomRemixApi>