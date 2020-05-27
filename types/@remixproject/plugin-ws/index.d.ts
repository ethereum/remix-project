declare module '@remixproject/plugin-ws' {
import { PluginApi, ApiMap, ProfileMap, Api, RemixApi } from '../utils';
import { PluginClient, PluginOptions } from '@remixproject/plugin/client';
export interface WS {
    send(data: string): void;
    on(type: 'message', cb: (event: WSData) => any): this;
}
export interface WSData {
    toString(): string;
}
export declare function connectWS(socket: WS, client: PluginClient): void;
/**
 * Connect the client to the socket
 * @param client A plugin client
 */
export declare function buildWebsocketClient<T extends Api, App extends ApiMap = RemixApi>(socket: WS, client: PluginClient<T, App>): PluginApi<GetApi<typeof client.options.customApi>> & PluginClient<T, App>;
/**
 * Create a plugin client that listen on socket messages
 * @param options The options for the client
 */
export declare function createWebsocketClient<T extends Api, App extends ApiMap = RemixApi>(socket: WS, options?: Partial<PluginOptions<App>>): PluginApi<GetApi<typeof options.customApi>> & PluginClient<T, App>;
declare type GetApi<T> = T extends ProfileMap<infer I> ? I : never;
export {};
}
