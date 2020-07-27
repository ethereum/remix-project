// Merge custom command types with nightwatch types

import { NightwatchBrowser, NightwatchAPI, NightwatchBrowser, NightwatchBrowser } from "nightwatch";

declare module "nightwatch" {
    export interface NightwatchCustomCommands {
        clickLaunchIcon(this: NightwatchBrowser, icon: string),
        switchBrowserTab(this: NightwatchBrowser, index: number)
    }

    export interface NightwatchBrowser {
        api: NightwatchAPI,
        emit: (status: string) => void
    }
}