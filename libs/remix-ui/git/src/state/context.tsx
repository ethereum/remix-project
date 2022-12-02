import React from "react"

export interface gitActions  {
    //clone(url: string, path: string): Promise<void>
    add(path: string): Promise<void>
    rm(path: string): Promise<void>
    commit(message: string): Promise<any>
    addall(): Promise<void>
    //push(): Promise<void>
    //pull(): Promise<void>
    //fetch(): Promise<void>
    checkoutfile(file: string): Promise<void>
    //checkout(branch: string): Promise<void>
    //createBranch(branch: string): Promise<void>
}

export const gitActionsContext = React.createContext<gitActions>(null)

export interface pluginActions {
    statusChanged(data: any): void
    loadFiles(): void
}

export const pluginActionsContext = React.createContext<pluginActions>(null)