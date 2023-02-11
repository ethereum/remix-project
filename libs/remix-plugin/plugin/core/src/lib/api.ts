import type { Profile, Api, MethodApi, CustomApi, ProfileMap, ApiMapFromProfileMap, PluginApi, ApiMap } from '@remixproject/plugin-utils'
import { PluginClient } from './client'

/**
 * Create an Api
 * @param profile The profile of the api
 */
export function createApi<T extends Api>(client: PluginClient<any, any>, profile: Profile<T>): CustomApi<T> {
  if (typeof profile.name !== 'string') {
    throw new Error('Profile should have a name')
  }
  const on = <event extends Extract<keyof T['events'], string>>(event: event, cb: T['events'][event]) => {
    client.on.call(client, profile.name, event, cb)
  }

  const methods = (profile.methods || []).reduce((acc, method) => ({
    ...acc,
    [method]: client.call.bind(client, profile.name, method)
  }), {} as MethodApi<T>)
  return { on, ...methods }
}


/**
 * Transform a list of profile into a map of API
 * @deprecated Use `applyApi` from connector instead
 */
export function getApiMap<T extends ProfileMap<App>, App extends ApiMap>(
  client: PluginClient<any, App>,
  profiles: T
): PluginApi<ApiMapFromProfileMap<T>> {
  return Object.keys(profiles).reduce((acc, name) => {
    const profile = profiles[name] as Profile<Api>
    return { ...acc, [name]: createApi(client, profile ) }
  }, {} as PluginApi<ApiMapFromProfileMap<T>>)
}
