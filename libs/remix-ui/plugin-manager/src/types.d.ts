import { PermissionHandler } from './app/ui/persmission-handler'
import { PluginManager } from '@remixproject/engine/lib/manager'
import { EventEmitter } from 'events'
import { Engine } from '@remixproject/engine/lib/engine'
/* eslint-disable camelcase */

declare module 'yo-yo'{
  interface yo_yo {
    (strings:string[], ...values:any[]):HTMLElement;
    update(element:HTMLElement, element2:HTMLElement);
  }
  var yo:yo_yo
  export = yo;
}

declare module 'dom-css'{
 interface dom_css{
   (element:HTMLElement, css:any):void;
 }

 var css:dom_css
 export = css;
}

interface SetPluginOptionType {
  queueTimeout: number
}

export interface _Paq {
  _paq: Window & typeof globalThis | []
}

export class RemixEngine extends Engine {
  event: EventEmitter;
  setPluginOption ({ name, kind }) : SetPluginOptionType
  onRegistration (plugin) : void
}

export function isNative(name: any): any;
/**
 * Checks if plugin caller 'from' is allowed to activate plugin 'to'
 * The caller can have 'canActivate' as a optional property in the plugin profile.
 * This is an array containing the 'name' property of the plugin it wants to call.
 * canActivate = ['plugin1-to-call','plugin2-to-call',....]
 * or the plugin is allowed by default because it is native
 *
 * @param {any, any}
 * @returns {boolean}
 */
export function canActivate(from: any, to: any): boolean;
export class RemixAppManager extends PluginManager {
  constructor();
    event: EventEmitter;
    pluginsDirectory: string;
    pluginLoader: PluginLoader;
    permissionHandler: PermissionHandler;
    getAll(): import('@remixproject/plugin-utils').Profile<any>[];
    getIds(): string[];
    isDependent(name: any): any;
    isRequired(name: any): any;
    registeredPlugins(): Promise<any>;
}

export interface PluginManagerContextProviderProps {
  appManager: RemixAppManager
  engine: RemixEngine
  _paq: _Paq
  filter: string
  actives: Profile[]
  inactives: Profile[]
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: (name: string) => boolean
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  profile: Profile
  inactivesCount: number
  activesCount: number
  headingLabel: string
}

export interface RemixUiPluginManagerProps {
  appManager: RemixAppManager
  engine: RemixEngine
  _paq: _Paq
  filter: string
  actives: Profile[]
  inactives: Profile[]
  activatePlugin: (name: string) => void
  deActivatePlugin: (name: string) => void
  isActive: (name: string) => any
  openLocalPlugin: () => Promise<void>
  filterPlugins: () => void
  profile: Profile
  inactivesCount: number
  activesCount: number
  headingLabel: string
}
/** @class Reference loaders.
 *  A loader is a get,set based object which load a workspace from a defined sources.
 *  (localStorage, queryParams)
 **/
declare class PluginLoader {
  get currentLoader(): any;
    donotAutoReload: string[];
    loaders: {};
    current: string;
    set(plugin: any, actives: any): void;
    get(): any;
}
export { }
