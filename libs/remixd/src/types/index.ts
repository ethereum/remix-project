import * as ServiceList from '../serviceList'
import * as Websocket from 'ws'

type ServiceListKeys = keyof typeof ServiceList;

export type SharedFolder = typeof ServiceList[ServiceListKeys]

export type SharedFolderClient = InstanceType<typeof ServiceList[ServiceListKeys]>

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
