import { MethodKey, Api, ApiMap, EventKey } from './api'

/** Describe a plugin */
export interface Profile<T extends Api = any> {
  name: string
  displayName?: string
  methods?: MethodKey<T>[]
  events?: EventKey<T>[]
  permission?: boolean
  hash?: string
  description?: string
  documentation?: string
  version?: string
  kind?: string,
  canActivate?: string[]
  icon?: string
  maintainedBy?: string,
  author?: string
  repo?: string
  authorContact?: string
}

export interface LocationProfile {
  location: string
}

export interface ExternalProfile {
  url: string
}

// export interface ExternalProfile<T extends Api = any> extends ViewProfile<T> {
//   url: string
// }

export interface HostProfile extends Profile {
  methods: ('addView' | 'removeView' | 'focus' | string)[]
}

export interface LibraryProfile<T extends Api = any> extends Profile<T> {
  events?: EventKey<T>[]
  notifications?: {
    [name: string]: string[]
  }
}


/** A map of profile */
export type ProfileMap<T extends ApiMap> = Partial<{
  [name in keyof T]: Profile<T[name]>
}>

// PROFILE TO API

/** Extract the API of a profile */
export type ApiFromProfile<T> = T extends Profile<infer I> ? I : never
/** Create an ApiMap from a Profile Map */
export type ApiMapFromProfileMap<T extends ProfileMap<any>> = {
  [name in keyof T]: ApiFromProfile<T[name]>
}

/** Transform an ApiMap into a profile map */
export type ProfileMapFromApiMap<T extends ApiMap> = Readonly<{
  [name in keyof T]: Profile<T[name]>
}>
