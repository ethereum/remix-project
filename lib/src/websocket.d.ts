/// <reference types="node" />
import * as WS from 'ws';
import * as http from 'http';
import RemixdClient from './services/remixdClient';
export default class WebSocket {
    port: number;
    opt: {
        [key: string]: string;
    };
    server: http.Server;
    wsServer: WS.Server;
    connection: WS;
    remixdClient: RemixdClient;
    constructor(port: number, opt: {
        [key: string]: string;
    }, remixdClient: RemixdClient);
    start(callback?: Function): void;
    send(data: any): void;
    close(): void;
}
