import React from "react"
import { commitChange } from "../types"

export interface gitActions  {
    clone(url: string, path: string, depth: number, cloneAllBranches: boolean): Promise<void>
    add(path: string): Promise<void>
    rm(path: string): Promise<void>
    commit(message: string): Promise<any>
    addall(): Promise<void>
    //push(): Promise<void>
    //pull(): Promise<void>
    //fetch(): Promise<void>
    repositories(): Promise<any>
    checkoutfile(file: string): Promise<void>
    checkout(cmd: any): Promise<void>
    createBranch(branch: string): Promise<void>
    remoteBranches(owner: string, repo: string): Promise<any>
    getCommitChanges(oid1: string, oid2: string): Promise<commitChange[]>
    diff(commitChange: commitChange): Promise<void>
    resolveRef(ref: string): Promise<string>
}

export const gitActionsContext = React.createContext<gitActions>(null)

export interface pluginActions {
    statusChanged(data: any): void
    loadFiles(): void
    openFile(path: string): Promise<void>
    openDiff(change: commitChange): Promise<void>
}

export const pluginActionsContext = React.createContext<pluginActions>(null)