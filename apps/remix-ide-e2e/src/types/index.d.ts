// Merge custom command types with nightwatch types

import { NightwatchBrowser, NightwatchBrowser, NightwatchBrowser } from "nightwatch";

declare module "nightwatch" {
    export interface NightwatchCustomCommands {
        clickLaunchIcon(this: NightwatchBrowser, icon: string): NightwatchBrowser,
        switchBrowserTab(this: NightwatchBrowser, index: number): NightwatchBrowser,
        scrollAndClick(this: NightwatchBrowser, target: string): NightwatchBrowser,
        scrollInto(this: NightwatchBrowser, target: string): NightwatchBrowser,
        testContracts(this: NightwatchBrowser, fileName: string, contractCode: ContractContent, compiledContractNames: string[]): NightwatchBrowser,
        setEditorValue(this: NightwatchBrowser, value: string, callback?: () => void): NightwatchBrowser,
        addFile(this: NightwatchBrowser, name: string, content: NightwatchContractContent): NightwatchBrowser,
        verifyContracts(this: NightwatchBrowser, compiledContractNames: string[]): NightwatchBrowser,
        selectAccount(this: NightwatchBrowser, account?: string): NightwatchBrowser,
        clickFunction(this: NightwatchBrowser, fnFullName: string, expectedInput?: NightwatchClickFunctionExpectedInput): NightwatchBrowser,
        testFunction(this: NightwatchBrowser, txHash: string, expectedInput: NightwatchTestFunctionExpectedInput): NightwatchBrowser,
        goToVMTraceStep(this: NightwatchBrowser, step: number, incr?: number): NightwatchBrowser
    }

    export interface NightwatchBrowser {
        api: this,
        emit: (status: string) => void,
        fullscreenWindow: (result?: any) => this
    }

    export interface NightwatchContractContent {
        content: string;
    }

    export interface NightwatchVerifyContractOpts {
        wait: number, 
        version?: string
    }

    export interface NightwatchClickFunctionExpectedInput {
        types: string,
        values: string
    }

    export interface NightwatchTestFunctionExpectedInput {
        [key: string]: any
    }
}