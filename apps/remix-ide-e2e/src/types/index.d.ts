// Merge custom command types with nightwatch types

import { NightwatchBrowser, NightwatchAPI, NightwatchBrowser, NightwatchBrowser } from "nightwatch";

declare module "nightwatch" {
    export interface NightwatchCustomCommands {
        clickLaunchIcon(this: NightwatchBrowser, icon: string): NightwatchBrowser,
        switchBrowserTab(this: NightwatchBrowser, index: number): NightwatchBrowser
    }

    export interface NightwatchBrowser {
        api: NightwatchAPI,
        emit: (status: string) => void,
        fullscreenWindow: (result?: any) => this,
        injectScript: (scriptUrl: string, callback?: VoidFunction) => this
    }
}