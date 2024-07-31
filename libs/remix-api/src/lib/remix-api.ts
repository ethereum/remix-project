import { IRemixApi } from "@remixproject/plugin-api"
import { StatusEvents } from "@remixproject/plugin-utils"
import { IConfigApi } from "./plugins/config-api"
import { IFileDecoratorApi } from "./plugins/filedecorator-api"
import { IExtendedFileSystem } from "./plugins/fileSystem-api"
import { IFs } from "./plugins/fs-api"
import { IGitApi } from "./plugins/git-api"
import { INotificationApi } from "./plugins/notification-api"
import { ISettings } from "./plugins/settings-api"
import { IExtendedTerminalApi } from "./plugins/terminal-api"
import { IFilePanelApi } from "./plugins/filePanel-api"
import { ISidePanelApi } from "./plugins/sidePanel-api"
import { IPinnedPanelApi } from "./plugins/pinned-panel-api"
import { ILayoutApi } from "./plugins/layout-api"
import { IMatomoApi } from "./plugins/matomo-api"

export interface ICustomRemixApi extends IRemixApi {
  dgitApi: IGitApi
  config: IConfigApi
  notification: INotificationApi
  settings: ISettings
  fileDecorator: IFileDecoratorApi
  fileManager: IExtendedFileSystem
  isogit: IGitApi,
  terminal: IExtendedTerminalApi
  fs: IFs
  filePanel: IFilePanelApi
  sidePanel: ISidePanelApi
  pinnedPanel: IPinnedPanelApi
  layout: ILayoutApi
  matomo: IMatomoApi
}

export declare type CustomRemixApi = Readonly<ICustomRemixApi>