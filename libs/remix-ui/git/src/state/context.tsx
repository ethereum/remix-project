import { ReadCommitResult } from "isomorphic-git"
import React from "react"
import { addInput, branch, checkoutInput, cloneInputType, commitChange, fetchInputType, fileStatusResult, gitLog, gitState, pullInputType, pushInputType, remote, rmInput } from "../types"

export interface gitActions {
    removeRemote(remote: remote): void
    clone(input: cloneInputType): Promise<void>
    add(input: addInput): Promise<void>
    rm(input: rmInput): Promise<void>
    commit(message: string): Promise<any>
    addall(files: fileStatusResult[]): Promise<void>
    push(input: pushInputType): Promise<void>
    pull(input: pullInputType): Promise<void>
    fetch(input: fetchInputType): Promise<void>
    repositories(): Promise<any>
    checkoutfile(file: string): Promise<void>
    checkout(input: checkoutInput): Promise<void>
    createBranch(branch: string): Promise<void>
    remoteBranches(owner: string, repo: string): Promise<any>
    getCommitChanges(oid1: string, oid2: string, branch?: branch, remote?: remote): Promise<commitChange[] | boolean>
    getBranchCommits(branch: branch, page: number): Promise<void>
    getBranchDifferences(branch: branch, remote?: remote, state?: gitState): Promise<void>
    loadGitHubUserFromToken(): Promise<any>
    diff(commitChange: commitChange): Promise<void>
    resolveRef(ref: string): Promise<string>
    setUpstreamRemote(upstream: remote): Promise<void>
    getBranches: () => Promise<void>
    getRemotes: () => Promise<void>
    setDefaultRemote: (remote: remote) => Promise<void>
    addRemote: (remote: remote) => Promise<void>
    sendToGitLog: (message: gitLog) => Promise<void>
    clearGitLog: () => Promise<void>
    getFileStatusMatrix(filespaths:[]): Promise<void>
    gitlog(depth: number): Promise<void>
    init(): Promise<void>
    setStateGitLogCount(count: number): Promise<void>
}

export const gitActionsContext = React.createContext<gitActions>(null)

export interface pluginActions {
    statusChanged(data: any): void
    loadFiles(): void
    openFile(path: string): Promise<void>
    openDiff(change: commitChange): Promise<void>
    saveToken(token: string): Promise<void>
    saveGitHubCredentials({
      username,
      email,
      token
    }): Promise<void>
    getGitHubCredentialsFromLocalStorage(): Promise<{
        username: string
        email: string
        token: string
    }>
    showAlert({ title, message }:{title: string, message: string}): Promise<void>
}

export const pluginActionsContext = React.createContext<pluginActions>(null)