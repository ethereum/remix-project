// Merge custom command types with nightwatch types

import { NightwatchBrowser, NightwatchBrowser, NightwatchBrowser } from "nightwatch";

declare module "nightwatch" {
    export interface NightwatchCustomCommands {
        clickLaunchIcon(icon: string): NightwatchBrowser,
        switchBrowserTab(index: number): NightwatchBrowser,
        scrollAndClick(target: string): NightwatchBrowser,
        scrollInto(target: string): NightwatchBrowser,
        testContracts(fileName: string, contractCode: NightwatchContractContent, compiledContractNames: string[]): NightwatchBrowser,
        setEditorValue(value: string, callback?: () => void): NightwatchBrowser,
        addFile(name: string, content: NightwatchContractContent): NightwatchBrowser,
        verifyContracts(compiledContractNames: string[], opts?: { wait: number, version: string }): NightwatchBrowser,
        selectAccount(account?: string): NightwatchBrowser,
        clickFunction(fnFullName: string, expectedInput?: NightwatchClickFunctionExpectedInput): NightwatchBrowser,
        testFunction(txHash: string, expectedInput: NightwatchTestFunctionExpectedInput): NightwatchBrowser,
        goToVMTraceStep(step: number, incr?: number): NightwatchBrowser,
        checkVariableDebug(id: string, debugValue: NightwatchCheckVariableDebugValue): NightwatchBrowser,
        addAtAddressInstance(address: string, isValidFormat: boolean, isValidChecksum: boolean): NightwatchBrowser,
        modalFooterOKClick(): NightwatchBrowser,
        clickInstance(index: number): NightwatchBrowser,
        journalLastChildIncludes(val: string): NightwatchBrowser,
        executeScript(script: string): NightwatchBrowser,
        clearEditableContent(cssSelector: string): NightwatchBrowser,
        journalChildIncludes(val: string): NightwatchBrowser,
        debugTransaction(index: number): NightwatchBrowser,
        checkElementStyle(cssSelector: string, styleProperty: string, expectedResult: string): NightwatchBrowser,
        openFile(name: string): NightwatchBrowser,
        editorScroll(direction: 'up' | 'down', numberOfTimes: number): NightwatchBrowser,
        renameFile(path: string, newFileName: string, renamedPath: string): NightwatchBrowser,
        rightClick(cssSelector: string): NightwatchBrowser,
        waitForElementContainsText(id: string, value: string): NightwatchBrowser,
        getModalBody(callback: CallableFunction): NightwatchBrowser,
        modalFooterCancelClick(): NightwatchBrowser
    }

    export interface NightwatchBrowser {
        api: this,
        emit: (status: string) => void,
        fullscreenWindow: (result?: any) => this,
        capabilities: {
            browserName: string
        }
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

    export type NightwatchCheckVariableDebugValue = NightwatchTestFunctionExpectedInput
}