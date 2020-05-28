import WebSocket from '../websocket';
import { PluginClient } from '@remixproject/plugin-ws';
export default class RemixdClient extends PluginClient {
    trackDownStreamUpdate: {
        [key: string]: string;
    };
    websocket: WebSocket | null;
    currentSharedFolder: string;
    readOnly: boolean;
    setWebSocket(websocket: WebSocket): void;
    sharedFolder(currentSharedFolder: string, readOnly: boolean): void;
    list(args: {
        [key: string]: string;
    }, cb: Function): void;
    resolveDirectory(args: {
        [key: string]: string;
    }, cb: Function): void;
    folderIsReadOnly(args: {
        [key: string]: string;
    }, cb: Function): any;
    get(args: {
        [key: string]: string;
    }, cb: Function): any;
    exists(args: {
        [key: string]: string;
    }, cb: Function): void;
    set(args: {
        [key: string]: string;
    }, cb: Function): any;
    rename(args: {
        [key: string]: string;
    }, cb: Function): any;
    remove(args: {
        [key: string]: string;
    }, cb: Function): any;
    isDirectory(args: {
        [key: string]: string;
    }, cb: Function): void;
    isFile(args: {
        [key: string]: string;
    }, cb: Function): void;
}
