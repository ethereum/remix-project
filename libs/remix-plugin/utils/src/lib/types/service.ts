export type IPluginService<T extends Record<string, any> = any> = {
  methods: string[]
  readonly path: string
} & T

export type GetPluginService<S extends Record<string, any>> = S extends IPluginService<infer I> ? S : IPluginService<S>