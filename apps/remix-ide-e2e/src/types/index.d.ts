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
        verifyContracts(compiledContractNames: string[], opts?: { wait: number, version?: string }): NightwatchBrowser,
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
        renamePath(path: string, newFileName: string, renamedPath: string): NightwatchBrowser,
        rightClick(cssSelector: string): NightwatchBrowser,
        waitForElementContainsText(id: string, value: string, timeout?: number): NightwatchBrowser,
        getModalBody(callback: (value: string, cb: VoidFunction) => void): NightwatchBrowser,
        modalFooterCancelClick(): NightwatchBrowser,
        selectContract(contractName: string): NightwatchBrowser,
        createContract(inputParams: string): NightwatchBrowser,
        getAddressAtPosition(index: number, cb: (pos: string) => void): NightwatchBrowser,
        testConstantFunction(address: string, fnFullName: string, expectedInput: NightwatchTestConstantFunctionExpectedInput | null, expectedOutput: string): NightwatchBrowser,
        getEditorValue(callback: (content: string) => void): NightwatchBrowser,
        getInstalledPlugins(cb: (plugins: string[]) => void): NightwatchBrowser,
        verifyCallReturnValue(address: string, checks: string[]): NightwatchBrowser,
        testEditorValue(testvalue: string): NightwatchBrowser,
        removeFile(path: string, workspace: string): NightwatchBrowser,
        switchBrowserWindow(url: string, windowName: string, cb: (browser: NightwatchBrowser, window?: NightwatchCallbackResult<Window>) => void): NightwatchBrowser,
        setupMetamask(passphrase: string, password: string): NightwatchBrowser,
        signMessage(msg: string, callback: (hash: { value: string }, signature: { value: string }) => void): NightwatchBrowser,
        setSolidityCompilerVersion(version: string): NightwatchBrowser,
        clickElementAtPosition(cssSelector: string, index: number): NightwatchBrowser,
        notContainsText(cssSelector: string, text: string): NightwatchBrowser,
        sendLowLevelTx(address: string, value: string, callData: string): NightwatchBrowser,
        journalLastChild(val: string): NightwatchBrowser,
        checkTerminalFilter(filter: string, test: string): NightwatchBrowser,
        noWorkerErrorFor(version: string): NightwatchBrowser,
        validateValueInput(selector: string, valueTosSet: string, expectedValue: string): NightwatchBrowser
        checkAnnotations(type: string, line: number): NightwatchBrowser
        checkAnnotationsNotPresent(type: string): NightwatchBrowser
        getLastTransactionHash(callback: (hash: string) => void)
    }

    export interface NightwatchBrowser {
        api: this,
        emit: (status: string) => void,
        fullscreenWindow: (result?: any) => this,
        keys(keysToSend: string, callback?: (this: NightwatchAPI, result: NightwatchCallbackResult<void>) => void): NightwatchBrowser,
        sendKeys: (selector: string, inputValue: string | string[], callback?: (this: NightwatchAPI, result: NightwatchCallbackResult<void>) => void) => NightwatchBrowser
    }

    export interface NightwatchAPI {
        keys(keysToSend: string, callback?: (this: NightwatchAPI, result: NightwatchCallbackResult<void>) => void): NightwatchAPI
    }

    export interface NightwatchContractContent {
        content: string;
    }

    export interface NightwatchClickFunctionExpectedInput {
        types: string,
        values: string
    }

    export interface NightwatchTestFunctionExpectedInput {
        [key: string]: any
    }

    export interface NightwatchTestConstantFunctionExpectedInput {
        types: string,
        values: string
    }

    export type NightwatchCheckVariableDebugValue = NightwatchTestFunctionExpectedInput
}