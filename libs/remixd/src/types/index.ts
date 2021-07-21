import * as ServiceList from '../serviceList'
import * as Websocket from 'ws'

export interface OutputStandard {
    description: string
    title: string
    confidence: string
    severity: string
    sourceMap: any
    category?: string
    reference?: string
    example?: any
    [key: string]: any
}

type ServiceListKeys = keyof typeof ServiceList;

export type Service = typeof ServiceList[ServiceListKeys]

export type ServiceClient = InstanceType<typeof ServiceList[ServiceListKeys]>

export type WebsocketOpt = {
    remixIdeUrl: string
}

export type FolderArgs = {
    path: string
}

export type KeyPairString = {
    [key: string]: string
}

export type ResolveDirectory = {
    [key: string]: {
        isDirectory: boolean
    }
}

export type FileContent = {
    content: string
    readonly: boolean
}

export type TrackDownStreamUpdate = KeyPairString

export type SharedFolderArgs = FolderArgs & KeyPairString

export type WS = typeof Websocket

export type Filelist = KeyPairString
