import { StatusEvents } from "@remixproject/plugin-utils"
import { ReadBlobResult, ReadCommitResult, StatusRow } from "isomorphic-git"
import { commitChange, repositoriesInput, repository, cloneInputType, branchesInputType, branch, remote, logInputType, remoteCommitsInputType, pagedCommits, fetchInputType, pullInputType, pushInputType, currentBranchInput, branchInputType, checkoutInputType, addInputType, rmInputType, resolveRefInput, readBlobInput, commitInputType, statusInput, compareBranchesInput, branchDifference, initInputType, updateSubmodulesInput } from "../types/git"

export interface IGitApi {
  events: {
      "checkout": () => void
      "clone": () => void
      "add": () => void
      "rm": () => void
      "commit": () => void
      "branch": () => void
      "init": () => void
  } & StatusEvents,
  methods: {
      getCommitChanges(oid1: string, oid2: string): Promise<commitChange[]>
      repositories(input: repositoriesInput): Promise<repository[]>
      clone(input: cloneInputType): Promise<any>
      branches(input?: branchesInputType): Promise<branch[]>,
      remotes(): Promise<remote[]>,
      log(input: logInputType): Promise<ReadCommitResult[]>,
      remotecommits(input: remoteCommitsInputType): Promise<pagedCommits[]>
      fetch(input: fetchInputType): Promise<any>
      pull(input: pullInputType): Promise<any>
      push(input: pushInputType): Promise<any>
      currentbranch(input?: currentBranchInput): Promise<branch>
      branch(input: branchInputType): Promise<void>
      checkout(input: checkoutInputType): Promise<void>
      add(input: addInputType): Promise<void>
      rm(input: rmInputType): Promise<void>
      resolveref(input: resolveRefInput): Promise<string>
      readblob(input: readBlobInput): Promise<ReadBlobResult>
      commit(input: commitInputType): Promise<string>
      addremote(input: remote): Promise<void>
      delremote(input: remote): Promise<void>
      status(input?: statusInput): Promise<Array<StatusRow>>
      compareBranches(input: compareBranchesInput): Promise<branchDifference>
      init(input?: initInputType): Promise<void>
      updateSubmodules: (input: updateSubmodulesInput) => Promise<void>
      version: () => Promise<string>
  }
}

