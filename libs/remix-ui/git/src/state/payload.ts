import { fileStatusResult } from "../types"

export const fileStatus = (files: fileStatusResult[]) => {
    return {
        type: 'FILE_STATUS',
        payload: files
    }
}

export const setLoading = (loading: boolean) => {
    return {
        type: 'SET_LOADING',
        payload: loading
    }
}

export const setCanUseApp = (canUseApp: boolean) => {
    return {
        type: 'SET_CAN_USE_APP',
        payload: canUseApp
    }
}

export const setRepoName = (reponame: string) => {
    return {
        type: 'SET_REPO_NAME',
        payload: reponame
    }
}