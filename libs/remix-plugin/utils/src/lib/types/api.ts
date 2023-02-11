import { StatusEvents } from './status'

export interface Api {
  events: {
    [key: string]: (...args: any[]) => void
  } & StatusEvents
  methods: {
    [key: string]: (...args: any[]) => void
  }
}

// Used by plugin.on and plugin.emit
export type EventKey<T extends Api> = Extract<keyof T['events'], string>
export type EventParams<T extends Api, K extends EventKey<T>> = T extends Api
  ? Parameters<T['events'][K]>
  : any[]
export type EventCallback<T extends Api, K extends EventKey<T>> = T extends Api
  ? T['events'][K]
  : (...payload: any[]) => void

// Used by plugin.call
export type MethodKey<T extends Api> = Extract<keyof T['methods'], string>
export type MethodParams<T extends Api, K extends MethodKey<T>> = T extends Api
  ? Parameters<T['methods'][K]>
  : any[]

  /////////
// API //
/////////

// Get the events of the Api
export interface EventApi<T extends Api> {
  on: <event extends EventKey<T>>(name: event, cb: T['events'][event]) => void
}
// Get the methods of the Api
export type MethodApi<T extends Api> = {
  [m in Extract<keyof T['methods'], string>]: (
    ...args: Parameters<T['methods'][m]>
  ) => Promise<ReturnType<T['methods'][m]>>
}
// Create the Api interface
export type CustomApi<T extends Api> = EventApi<T> & MethodApi<T>

/** A map of Api used to describe all the plugin's api in the project */
export type ApiMap = Readonly<Record<string, Api>>

/** A map of plugin based on the ApiMap. It enforces the PluginEngine */
export type PluginApi<T extends ApiMap> = {
  [name in keyof T]: CustomApi<T[name]>
}

// The interface that a Plugin should implement
export type API<T extends Api> = {
  [M in keyof T['methods']]: T['methods'][M] | Promise<T['methods'][M]>
}
